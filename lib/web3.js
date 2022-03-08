import Web3 from 'web3'
 import Planetary from './Planetary.json'

// talk to correct network 
let web3 = new Web3("https://rinkeby.infura.io/v3/29599386b0b84a04909e0a96fd07ad96")

const contractAddress = "0x86aB459Bb921A7988704203fec75A9aB8172C06e"
const contract = new web3.eth.Contract(Planetary.abi, contractAddress)

export { web3, contract, contractAddress }