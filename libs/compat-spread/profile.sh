#!/usr/bin/env bash

set -euo pipefail

fail() {
  printf 'compat-profile: %s\n' "$1" >&2
  exit 1
}

validate_profile() {
  local major="$1"
  local profile="$2"

  case "$profile" in
    view-engine-zoned)
      [ "$major" -le 11 ] || fail "$profile is not supported by Angular $major"
      ;;
    ivy-zoned)
      [ "$major" -ge 9 ] || fail "$profile is not supported by Angular $major"
      ;;
    ivy-zoneless)
      [ "$major" -ge 20 ] || fail "$profile is not supported by Angular $major"
      ;;
    *)
      fail "unknown profile: $profile"
      ;;
  esac
}

[ "$#" -ge 3 ] || fail "usage: profile.sh <files|test> <project> [es] <profile>"

action="$1"
project="$2"
versioned=true

if [[ "$project" =~ ^a([0-9]+)(es5|es2015)?$ ]]; then
  major="${BASH_REMATCH[1]}"
else
  case "$project" in
    jasmine|jest|min|nx)
      major=""
      versioned=false
      ;;
    *)
      fail "unknown Angular project: $project"
      ;;
  esac
fi

case "$action" in
  files)
    [ "$#" -eq 3 ] || fail "files expects: <project> <profile>"
    profile="$3"

    if [ "$versioned" = true ]; then
      validate_profile "$major" "$profile"
    elif [ "$profile" != "ivy-zoned" ]; then
      fail "$project supports only the ivy-zoned profile"
    fi

    case "$profile" in
      ivy-zoneless)
        environment="zoneless"
        ;;
      *)
        environment="zoned"
        ;;
    esac

    if [ "$versioned" = false ]; then
      script="s:files:${project}"
    elif [ "$major" -ge 20 ]; then
      script="s:files:${project}${environment}"
    else
      script="s:files:${project}"
    fi
    ;;
  test)
    [ "$#" -eq 4 ] || fail "test expects: <project> <es> <profile>"
    es="$3"
    profile="$4"

    if [ "$versioned" = false ]; then
      [ -z "$es" ] || fail "$project does not use a separate ES target"
      [ "$profile" = "ivy-zoned" ] || fail "$project supports only the ivy-zoned profile"
      script="test:${project}"
    else
      validate_profile "$major" "$profile"

      if [ "$major" -eq 5 ]; then
        [ -z "$es" ] || fail "Angular 5 stores the ES target in the project name"
      elif [ "$major" -le 14 ]; then
        case "$es" in
          es5|es2015)
            ;;
          *)
            fail "Angular $major requires an es5 or es2015 target"
            ;;
        esac
      else
        [ -z "$es" ] || fail "Angular $major does not use a separate ES target"
      fi

      case "$profile" in
        view-engine-zoned)
          suffix=""
          ;;
        ivy-zoned)
          if [ "$major" -le 14 ]; then
            suffix="ivy"
          elif [ "$major" -le 19 ]; then
            suffix=""
          else
            suffix="zoned"
          fi
          ;;
        ivy-zoneless)
          suffix="zoneless"
          ;;
      esac

      script="test:${project}${es}${suffix}"
    fi
    ;;
  *)
    fail "unknown action: $action"
    ;;
esac

printf 'compat-profile action=%s project=%s profile=%s script=%s\n' \
  "$action" \
  "$project" \
  "$profile" \
  "$script"

exec npm run "$script"
