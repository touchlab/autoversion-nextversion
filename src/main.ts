import * as core from '@actions/core'
import {simpleGit, TagResult} from "simple-git";
import semver from 'semver/preload'

const TEMP_PUBLISH_PREFIX = "autoversion-tmp-publishing-"

function findNextVersion(versionBase: string, tags: TagResult) {
  const versionBaseCompare = `${versionBase}.`
  const matching = tags.all
      .map(t => t.startsWith(TEMP_PUBLISH_PREFIX) ? t.substring(TEMP_PUBLISH_PREFIX.length) : t)
      .filter(t => t.startsWith(versionBaseCompare))
      .map(t => semver.parse(t))
      .filter(ver => ver !== null && ver !== undefined)

  const sorted = matching.sort((v1, v2) => v2!.compare(v1!))
  const nextPatch = sorted.length > 0 ? sorted[0]!.patch + 1 : 0
  return `${versionBase}.${nextPatch}`;
}

export async function run(): Promise<void> {
  try {
    const versionBase: string = core.getInput('versionBase')

    core.debug(`versionBase: ${versionBase}`)

    const git = simpleGit();
    const tags = await git.tags()
    const nextVersion = findNextVersion(versionBase, tags);

    core.debug(`nextVersion: ${nextVersion}`)

    core.setOutput('nextVersion', nextVersion)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
