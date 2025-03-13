import { Tree } from '@angular-devkit/schematics';
import { buildDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { parseName } from '@schematics/angular/utility/parse-name';

export async function ensurePath(tree: Tree, options: any): Promise<void> {
  const workspace = await getWorkspace(tree);

  if (!options.project) {
    options.project = workspace.projects.keys().next().value;
  }

  const project = workspace.projects.get(options.project as string);

  if (options.path === undefined && project) {
    options.path = buildDefaultPath(project);
  }

  const parsedPath = parseName(options.path as string, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;
}