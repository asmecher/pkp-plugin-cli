const shell = require('shelljs')
const { log } = require('../utils/log')
const extractAllReleasesFromXml = require('../utils/plugins/extractAllReleasesFromXml')

module.exports = async (
  { tarFile, md5, packageUrl },
  pluginsFilePath = './plugins.xml'
) => {
  const releases = await extractAllReleasesFromXml(pluginsFilePath)
  log(`Finding matching plugin for this release...`)
  const matchingRelease = releases.find(release => {
    return release.expectedMd5Sum === md5 && release.url === packageUrl
  })
  log(`Found plugin "${matchingRelease.plugin.name}"`)

  const tarCommand = shell.exec(`tar -tf ${tarFile}`)
  if (tarCommand.code !== 0) throw 'Error opening tar file'
  tarCommand
    .trim()
    .split(/\n/)
    .forEach(line => {
      if (!line.match(new RegExp(`^${matchingRelease.plugin.name}/`, 'g'))) {
        throw `Validation of tar file failed: There should be only one folder in the root of the extracted file named "${matchingRelease.plugin.name}"`
      }
    })
}
