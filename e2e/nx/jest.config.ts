import { getJestProjects } from '@nrwl/jest';

export default {
  coverageDirectory: './coverage/apps/a-nx',
  projects: getJestProjects(),
};
