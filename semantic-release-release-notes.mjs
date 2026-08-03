import { generateNotes as generateReleaseNotes } from '@semantic-release/release-notes-generator';

const pullRequestSuffix = /\s+\(#\d+\)$/u;

const getSubject = commit => commit.subject ?? commit.message.split('\n', 1)[0];

export const deduplicateCommits = commits => {
  const uniqueCommits = [];
  const commitIndexes = new Map();

  for (const commit of commits) {
    const subject = getSubject(commit);
    const tree = commit.tree?.long;
    const normalizedSubject = subject.replace(pullRequestSuffix, '');
    const key = tree && normalizedSubject ? `${tree}\0${normalizedSubject}` : undefined;
    const existingIndex = key && commitIndexes.get(key);

    if (existingIndex === undefined) {
      if (key) {
        commitIndexes.set(key, uniqueCommits.length);
      }
      uniqueCommits.push(commit);
      continue;
    }

    const existingSubject = getSubject(uniqueCommits[existingIndex]);
    if (pullRequestSuffix.test(subject) && !pullRequestSuffix.test(existingSubject)) {
      uniqueCommits[existingIndex] = commit;
    }
  }

  return uniqueCommits;
};

export const generateNotes = (pluginConfig, context) =>
  generateReleaseNotes(pluginConfig, {
    ...context,
    // Clean merges can expose both the merge and its already-contained commit.
    commits: deduplicateCommits(context.commits),
  });
