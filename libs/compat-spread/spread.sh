#!/usr/bin/env bash

set -euo pipefail

shopt -s extglob

DEFAULT_CONFIG_PATH="spread.conf"

trim() {
  local value="$1"

  value="${value##+([[:space:]])}"
  value="${value%%+([[:space:]])}"

  printf '%s' "$value"
}

normalize_path() {
  local value

  value="$(trim "$1")"
  value="${value//\\//}"

  while [ "${value#./}" != "$value" ]; do
    value="${value#./}"
  done

  while [ -n "$value" ] && [ "${value%/}" != "$value" ]; do
    value="${value%/}"
  done

  printf '%s' "$value"
}

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

validate_selector() {
  local selector="$1"
  local label="$2"
  local token
  local tokens

  selector="${selector//[[:space:]]/}"

  [ -n "$selector" ] || fail "$label must not be empty"

  IFS=',' read -r -a tokens <<< "$selector"

  for token in "${tokens[@]}"; do
    [ -n "$token" ] || fail "$label has an empty selector part"

    if [[ $token =~ ^[0-9]+$ ]]; then
      continue
    fi

    if [[ $token =~ ^[0-9]+\+$ ]]; then
      continue
    fi

    if [[ $token =~ ^[0-9]+-[0-9]+$ ]]; then
      continue
    fi

    fail "$label has an invalid selector part: $token"
  done
}

selector_matches() {
  local selector="$1"
  local major="$2"
  local start
  local end
  local token
  local tokens

  [ -n "$selector" ] || return 0

  selector="${selector//[[:space:]]/}"
  IFS=',' read -r -a tokens <<< "$selector"

  for token in "${tokens[@]}"; do
    if [[ $token =~ ^[0-9]+$ ]]; then
      if [ "$major" -eq "$token" ]; then
        return 0
      fi
      continue
    fi

    if [[ $token =~ ^([0-9]+)\+$ ]]; then
      start="${BASH_REMATCH[1]}"
      if [ "$major" -ge "$start" ]; then
        return 0
      fi
      continue
    fi

    if [[ $token =~ ^([0-9]+)-([0-9]+)$ ]]; then
      start="${BASH_REMATCH[1]}"
      end="${BASH_REMATCH[2]}"
      if [ "$major" -ge "$start" ] && [ "$major" -le "$end" ]; then
        return 0
      fi
    fi
  done

  return 1
}

glob_base() {
  local glob="$1"
  local base=""
  local part
  local parts

  IFS='/' read -r -a parts <<< "$glob"

  for part in "${parts[@]}"; do
    case "$part" in
      *'*'*|*'?'*|*'['*)
        break
        ;;
      *)
        if [ -n "$base" ]; then
          base="$base/$part"
        else
          base="$part"
        fi
        ;;
    esac
  done

  if [ -n "$base" ]; then
    printf '%s' "$base"
  else
    printf '.'
  fi
}

find_feature_selector() {
  local name="$1"
  local index=0

  while [ "$index" -lt "${#FEATURE_NAMES[@]}" ]; do
    if [ "${FEATURE_NAMES[$index]}" = "$name" ]; then
      printf '%s' "${FEATURE_SELECTORS[$index]}"
      return 0
    fi

    index=$((index + 1))
  done

  return 1
}

contains_in_array() {
  local needle="$1"
  local value

  shift

  for value in "$@"; do
    if [ "$value" = "$needle" ]; then
      return 0
    fi
  done

  return 1
}

if [ "$#" -gt 2 ]; then
  fail "compat-spread accepts an optional config path and an optional versions mask"
fi

CONFIG_PATH="$DEFAULT_CONFIG_PATH"
VERSION_MASK=""

if [ "$#" -eq 1 ]; then
  if [ -f "$1" ]; then
    CONFIG_PATH="$1"
  else
    VERSION_MASK="$1"
  fi
elif [ "$#" -eq 2 ]; then
  CONFIG_PATH="$1"
  VERSION_MASK="$2"
fi

VERSION_MASK="$(normalize_path "$VERSION_MASK")"

[ -f "$CONFIG_PATH" ] || fail "Missing config: $(normalize_path "$CONFIG_PATH")"

VERSION_DESTS=()
VERSION_MAJORS=()
FEATURE_NAMES=()
FEATURE_SELECTORS=()
FILE_GLOBS=()
FILE_VERSION_SELECTORS=()
FILE_FEATURE_NAMES=()
FILE_STRIP_PREFIXES=()
FILE_CACHE_CONTENTS=()

line_number=0

while IFS= read -r raw_line || [ -n "$raw_line" ]; do
  line_number=$((line_number + 1))

  line="${raw_line%%#*}"
  line="$(trim "$line")"

  [ -n "$line" ] || continue

  IFS='|' read -r -a parts <<< "$line"

  kind="$(trim "${parts[0]}")"

  case "$kind" in
    version)
      [ "${#parts[@]}" -eq 3 ] || fail "Config line $line_number must be: version|<dest>|<major>"

      dest="$(normalize_path "${parts[1]}")"
      major="$(trim "${parts[2]}")"

      [ -n "$dest" ] || fail "Config line $line_number has an empty version destination"
      [[ $major =~ ^[0-9]+$ ]] || fail "Config line $line_number has an invalid major version: $major"

      VERSION_DESTS+=("$dest")
      VERSION_MAJORS+=("$major")
      ;;
    feature)
      [ "${#parts[@]}" -eq 3 ] || fail "Config line $line_number must be: feature|<name>|versions=<selector>"

      feature_name="$(trim "${parts[1]}")"
      feature_field="$(trim "${parts[2]}")"

      [ -n "$feature_name" ] || fail "Config line $line_number has an empty feature name"
      case "$feature_field" in
        versions=*)
          feature_selector="$(trim "${feature_field#versions=}")"
          ;;
        *)
          fail "Config line $line_number must define feature versions with versions=<selector>"
          ;;
      esac

      validate_selector "$feature_selector" "Config line $line_number"

      if find_feature_selector "$feature_name" >/dev/null 2>&1; then
        fail "Config line $line_number duplicates feature: $feature_name"
      fi

      FEATURE_NAMES+=("$feature_name")
      FEATURE_SELECTORS+=("${feature_selector//[[:space:]]/}")
      ;;
    file)
      [ "${#parts[@]}" -ge 2 ] || fail "Config line $line_number must be: file|<glob>|versions=<selector>|features=<a,b>|strip=<prefix>"

      file_glob="$(normalize_path "${parts[1]}")"
      file_selector=""
      file_features=""
      file_strip=""
      part_index=2

      [ -n "$file_glob" ] || fail "Config line $line_number has an empty file glob"

      while [ "$part_index" -lt "${#parts[@]}" ]; do
        file_field="$(trim "${parts[$part_index]}")"

        case "$file_field" in
          versions=*)
            [ -z "$file_selector" ] || fail "Config line $line_number duplicates versions=<selector>"
            file_selector="$(trim "${file_field#versions=}")"
            validate_selector "$file_selector" "Config line $line_number"
            file_selector="${file_selector//[[:space:]]/}"
            ;;
          features=*)
            [ -z "$file_features" ] || fail "Config line $line_number duplicates features=<...>"
            file_features="$(trim "${file_field#features=}")"
            file_features="${file_features//[[:space:]]/}"
            [ -n "$file_features" ] || fail "Config line $line_number has an empty features list"
            ;;
          strip=*)
            [ -z "$file_strip" ] || fail "Config line $line_number duplicates strip=<prefix>"
            file_strip="$(normalize_path "${file_field#strip=}")"
            [ -n "$file_strip" ] || fail "Config line $line_number has an empty strip prefix"
            ;;
          *)
            fail "Config line $line_number has an unknown file option: $file_field"
            ;;
        esac

        part_index=$((part_index + 1))
      done

      FILE_GLOBS+=("$file_glob")
      FILE_VERSION_SELECTORS+=("$file_selector")
      FILE_FEATURE_NAMES+=("$file_features")
      FILE_STRIP_PREFIXES+=("$file_strip")
      ;;
    *)
      fail "Config line $line_number has an unknown record type: $kind"
      ;;
  esac
done < "$CONFIG_PATH"

[ "${#VERSION_DESTS[@]}" -gt 0 ] || fail "Config has no version records"
[ "${#FILE_GLOBS[@]}" -gt 0 ] || fail "Config has no file records"

# Expand each file rule once up front so every destination reuses the same file list.
file_index=0
while [ "$file_index" -lt "${#FILE_FEATURE_NAMES[@]}" ]; do
  feature_names="${FILE_FEATURE_NAMES[$file_index]}"
  strip_prefix="${FILE_STRIP_PREFIXES[$file_index]}"
  cache_content=""

  if [ -n "$feature_names" ]; then
    IFS=',' read -r -a names <<< "$feature_names"

    for name in "${names[@]}"; do
      [ -n "$name" ] || fail "File rule ${FILE_GLOBS[$file_index]} has an empty feature name"
      find_feature_selector "$name" >/dev/null 2>&1 || fail "File rule ${FILE_GLOBS[$file_index]} references unknown feature: $name"
    done
  fi

  base_path="$(glob_base "${FILE_GLOBS[$file_index]}")"

  if [ -e "$base_path" ]; then
    while IFS= read -r found_path; do
      relative_path="$(normalize_path "${found_path#./}")"

      case "$relative_path" in
        ${FILE_GLOBS[$file_index]})
          destination_path="$relative_path"

          if [ -n "$strip_prefix" ]; then
            case "$relative_path" in
              "$strip_prefix"/*)
                destination_path="${relative_path#"$strip_prefix"/}"
                ;;
              *)
                fail "File rule ${FILE_GLOBS[$file_index]} has strip prefix that does not match: $relative_path"
                ;;
            esac
          fi

          if [ -n "$cache_content" ]; then
            cache_content+=$'\n'
          fi

          cache_content+="$relative_path|$destination_path"
          ;;
      esac
    done < <(find "$base_path" -type f | LC_ALL=C sort)
  fi

  FILE_CACHE_CONTENTS+=("$cache_content")
  file_index=$((file_index + 1))
done

matched_versions=0
version_index=0

while [ "$version_index" -lt "${#VERSION_DESTS[@]}" ]; do
  dest="${VERSION_DESTS[$version_index]}"
  major="${VERSION_MAJORS[$version_index]}"

  if [ -n "$VERSION_MASK" ]; then
    case "$dest" in
      "$VERSION_MASK"*)
        ;;
      *)
        version_index=$((version_index + 1))
        continue
        ;;
    esac
  fi

  matched_versions=$((matched_versions + 1))
  copied=0
  skipped_version=0
  skipped_feature=0
  seen_paths=()

  mkdir -p "$dest"

  file_index=0
  while [ "$file_index" -lt "${#FILE_GLOBS[@]}" ]; do
    decision="copy"
    file_selector="${FILE_VERSION_SELECTORS[$file_index]}"
    file_features="${FILE_FEATURE_NAMES[$file_index]}"

    if [ -n "$file_selector" ] && ! selector_matches "$file_selector" "$major"; then
      decision="version"
    fi

    if [ "$decision" = "copy" ] && [ -n "$file_features" ]; then
      IFS=',' read -r -a names <<< "$file_features"

      for name in "${names[@]}"; do
        feature_selector="$(find_feature_selector "$name")"

        if ! selector_matches "$feature_selector" "$major"; then
          decision="feature"
          break
        fi
      done
    fi

    # The first matching rule owns a file for this destination, even if it skips the copy.
    while IFS='|' read -r source_path relative_path || [ -n "$source_path$relative_path" ]; do
      [ -n "${source_path:-}" ] || continue

      if [ "${#seen_paths[@]}" -gt 0 ] && contains_in_array "$relative_path" "${seen_paths[@]}"; then
        continue
      fi

      seen_paths+=("$relative_path")

      case "$decision" in
        version)
          skipped_version=$((skipped_version + 1))
          continue
          ;;
        feature)
          skipped_feature=$((skipped_feature + 1))
          continue
          ;;
      esac

      destination_path="$dest/$relative_path"

      mkdir -p "$(dirname "$destination_path")"
      cp "$source_path" "$destination_path"
      copied=$((copied + 1))
    done <<< "${FILE_CACHE_CONTENTS[$file_index]}"

    file_index=$((file_index + 1))
  done

  printf 'spread-files dest=%s version=%s copied=%s skippedVersion=%s skippedFeature=%s\n' \
    "$dest" \
    "$major" \
    "$copied" \
    "$skipped_version" \
    "$skipped_feature"

  version_index=$((version_index + 1))
done

[ "$matched_versions" -gt 0 ] || fail "Unknown versions mask: $VERSION_MASK"
