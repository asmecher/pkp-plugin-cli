/**
 * @file src/utils/plugins/extractAllReleasesFromXml.js
 *
 * Copyright (c) 2020 Simon Fraser University
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 *
 * @brief Helper function to extract all releases from a Plugin Gallery xml file
 *
 * The function loops through the plugins and their releases and creates a text file containing a list
 * of the releases and their MD5 sums This is then consument by the bash script "checkMD5sum" that
 * downloads all the releases and compares their MD5 sums with the content of the generated file
 *
 * @param {string} filePath the path to the file to parse and extract the releases info from
 *
 */
const xml2js = require('xml2js')

const { readFile } = require('../files')
const { info, debug, error } = require('../log')

const parser = new xml2js.Parser()

const extractData = async filePath => {
  debug(`Extracting releases from ${filePath}`)

  const xml = await readFile(filePath)
  const releases = []

  const result = await parser.parseStringPromise(xml)

  debug(`${result.plugins.plugin.length} plugins found`)

  result.plugins.plugin.forEach(plugin => {
    if (!plugin.name) {
      error(`${JSON.stringify(plugin)}\n`)
      throw new Error('The last plugin does not have have a name attribute')
    }

    debug(`${plugin.name[0]._}: ${plugin.release.length} releases found`)
    plugin.release.forEach(release => {
      if (release.package.length > 1) {
        throw new Error('Each release should have one package')
      }
      const expectedMd5Sum = release.$.md5
      const version = release.$.version

      releases.push({
        expectedMd5Sum,
        version,
        url: release.package[0],
        plugin: {
          displayName: plugin.name[0]._,
          name: plugin.$.product
        }
      })
      debug('')
    })
  })

  info(
    `Extracted data successfuly. ${result.plugins.plugin.length} plugins / ${releases.length} releases`
  )
  return releases
}

module.exports = extractData
