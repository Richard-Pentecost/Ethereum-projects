const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// delete entire 'build' folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Read 'Campaign.sol' from the 'contracts' folder
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

// compile both contracts wth solidity compiler
const output = solc.compile(source, 1).contracts;

// creates the 'build' directory
fs.ensureDirSync(buildPath);

// writes compiled programs to new files in build directory 
for(let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]        // contents we want written to the file
    );
}