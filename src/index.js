import { promises as fs } from 'fs'
import clientes from './data/clientes.json' assert {type: "json"};
import Fuse from 'fuse.js'
import chalk from 'chalk';
import { dirname } from 'path'
import readline from 'readline'
const emoji = ['❌', '✅', '🟢'];

async function getFileNamesPlacesCollectds() {
  const { pathname: currentFile } = new URL(import.meta.url)
  const cwd = dirname(currentFile)
  const filesDir = `${cwd}/data/collected`
  const files = await fs.readdir(filesDir)

  return {files, filesDir}
}

async function setQuestionOnTerminal(searched, correspondence) {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log('\n')
  console.log(chalk.yellow(`Searched term: ${searched}\n`))

  console.log(chalk.blue('------------- Matches found -------------\n'))
  correspondence.forEach((correspondence, index) => {
    console.log(`[${index}] - ${correspondence.item.replace('.json', '')}\n`)
  })
  console.log(chalk.blue('-----------------------------------------\n'))

  const question = await new Promise(resolve => {
    reader.question(chalk.white('What is the best match?: '), async (answer) => {
      if(!correspondence[answer]){
        console.log(chalk.red('Invalid option, try again.'))
        return setQuestionOnTerminal(searched, correspondence)
      }
      console.log(chalk.white(`\n${emoji[2]} - Selected match --> ${correspondence[answer].item.replace('.json', '')}\n`));
      reader.close();
      resolve(answer)
    });
  })
  return question
}

async function searchCorrespondece(){
  const options = {
    threshold: 0.1,
  }
  const {files, filesDir} = await getFileNamesPlacesCollectds()
  const fuse = new Fuse(files, options);
  for (const cliente of clientes) {
    const query = cliente.name
    const result = fuse.search(query)
    if(result.length > 1){
      const resp = await setQuestionOnTerminal(query, result)
      appendData(query, result[resp].item)
      continue
    }
    if (result.length === 1) {
      appendData(query, result[0].item)
      continue
    }
    console.log(chalk.red(`${emoji[0]} - No match found for ${query}\n`))
    continue
  }
  console.log('Finished searchCorrespondece')
}

function appendData(query, file) {
  console.log(chalk.blueBright(`${emoji[1]} - Joining the [${query}] data to ---> [${file}]\n`))
}

searchCorrespondece()

