import { dependencyKeys, MetadataContribution, MetadataSubstitutions } from './core.types';

const entriesOf = (groups: MetadataContribution[] = []): Array<[unknown, unknown]> => {
  const entries: Array<[unknown, unknown]> = [];
  for (const group of groups) {
    entries.push(...group.entries);
  }

  return entries;
};

// The native snapshot of a cached mock contains the old emitted entries.
// Associate each occurrence with the current output of the same source leaf.
export const composeCachedMetadata = (
  metadata: Partial<Record<dependencyKeys, unknown[]>>,
  previous: MetadataSubstitutions,
  current: MetadataSubstitutions,
): MetadataSubstitutions => {
  const result: MetadataSubstitutions = {};
  for (const key of Object.keys(current) as dependencyKeys[]) {
    const before = entriesOf(previous[key]);
    const after = entriesOf(current[key]!);
    const used = new Set<number>();
    result[key] = (metadata[key] || []).map(original => {
      let index = -1;
      for (let position = 0; position < before.length; position += 1) {
        if (before[position][1] === original && !used.has(position)) {
          index = position;
          break;
        }
      }
      // Every native entry of the generated artifact was recorded at creation.
      used.add(index);
      const source = before[index][0];
      const occurrence = before.slice(0, index).filter(([from]) => from === source).length;
      const value = after.filter(([from]) => from === source)[occurrence]?.[1];

      return { original, entries: [[original, value]] };
    });
  }

  return result;
};

// A kept clone's additional automatic frame starts from its generated metadata.
// Rebase its source-group provenance through those newer emitted entries.
export const rebaseMetadata = (
  previous: MetadataSubstitutions,
  current: MetadataSubstitutions,
): MetadataSubstitutions => {
  const result: MetadataSubstitutions = {};
  for (const key of Object.keys(current) as dependencyKeys[]) {
    const next = current[key]!;
    const used = new Set<number>();
    result[key] = (previous[key] || []).map(group => {
      const entries: Array<[unknown, unknown]> = [];
      for (const [source, emitted] of group.entries) {
        const matches = next.filter((value, position) => value.original === emitted && !used.has(position));
        for (const match of matches.slice(0, 1)) {
          used.add(next.indexOf(match));
          for (const [, value] of match.entries) {
            entries.push([source, value]);
          }
        }
      }

      return { original: group.original, entries };
    });
  }

  return result;
};
