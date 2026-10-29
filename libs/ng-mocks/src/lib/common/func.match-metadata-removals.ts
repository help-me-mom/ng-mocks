class MetadataEntries {
  public entries: unknown[];

  public constructor(metadata: { entries: unknown[] }) {
    this.entries = metadata.entries;
  }
}

export type MetadataOverriderConstructor = new () => {
  overrideMetadata(
    metadataClass: typeof MetadataEntries,
    metadata: MetadataEntries,
    override: { remove: MetadataEntries },
  ): MetadataEntries;
};

const legacyRemovals = (original: unknown[], remove: unknown[]): unknown[] => {
  const references = new Map<unknown, string>();
  // Angular 5–6 compare JSON structures with stable function references.
  // Later versions also distinguish repeated objects; defer to their helper.
  const hash = (entry: unknown) =>
    JSON.stringify(entry, (_key, value: unknown) => {
      if (typeof value !== 'function') {
        return value;
      }
      if (!references.has(value)) {
        const name =
          (value as { overriddenName?: string }).overriddenName || value.name || value.toString().split('\n', 1)[0];
        references.set(value, `${name}${references.size}`);
      }

      return references.get(value);
    });
  const removed = remove.map(hash);

  return original.filter(entry => removed.indexOf(hash(entry)) !== -1);
};

export default (overrider?: MetadataOverriderConstructor) => {
  return (original: unknown[], remove: unknown[]): unknown[] => {
    if (!overrider) {
      return legacyRemovals(original, remove);
    }
    // A comparison must not retain dynamic declaration classes across resets.
    const remaining = new overrider().overrideMetadata(
      MetadataEntries,
      { entries: original },
      { remove: { entries: remove } },
    ).entries;

    return original.filter(entry => remaining.indexOf(entry) === -1);
  };
};
