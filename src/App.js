import { hexToDec } from 'hex2dec';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [transactionsList, setTransactionsList] = useState();
  const [minerWallet, setMinerWallet] = useState('')
  const [minerWalletAmountEther, setMinerWalletAmountEther] = useState('')
  const [selectedBlock, setSelectedBlock] = useState(0)
  const [NFT, setNFT] = useState({
    floorPrice: '',
    collectionUrl: '',
    priceCurrency: ''
  })

  const blockChangeHandler = (event) => {
    setSelectedBlock(event.target.value)
  }

  const getNFTHandler = (event) => {
    event.preventDefault()
    const nftContract = event.target[0].value
    getNFTData(nftContract)
  }

  // Fetch NFT and set it to state
  async function getNFTData(nftContract) {
    try {
      const nft = await alchemy.nft.getFloorPrice(nftContract)

      setNFT({
        floorPrice: `Floor Price: ${nft.openSea.floorPrice}`,
        collectionUrl: nft.openSea.collectionUrl.split('https://opensea.io/collection/')[1],
        priceCurrency: nft.openSea.priceCurrency
      })
    } catch {
      setNFT({
        floorPrice: '',
        collectionUrl: 'CONTRACT ADDRESS INCORRECT',
        priceCurrency: ''
      })
    }
  }

  // Fetch the current block number on page load
  useEffect(() => {
    async function getCurrentBlockNumber() {
      const currentBlockNumber = await alchemy.core.getBlockNumber();
      setBlockNumber(currentBlockNumber)
    }
    getCurrentBlockNumber();
  }, [])

  // Update UI when different block is searched for
  useEffect(() => {
    async function getTransactions() {
      const blockData = await alchemy.core.getBlockWithTransactions(blockNumber - selectedBlock);
      setMinerWallet(blockData.miner)
      const minerWalletAmount = await alchemy.core.getBalance(blockData.miner)
      setMinerWalletAmountEther(Utils.formatEther((hexToDec(minerWalletAmount._hex)), "ether"))
      const transactionsArr = blockData.transactions.splice(0, 5)
      setTransactionsList(transactionsArr.map((element, index) => {
        return <li key={index}>{Utils.formatEther(hexToDec(element.value._hex))}ETH {element.hash.toString().slice(0, 8)}</li>
      }))
    }
    getTransactions()
  }, [blockNumber, selectedBlock]);

  return (
    <>
      <h2>Ethereum</h2>
      <label name="block">Select Block: </label>
      <select name="block" onChange={blockChangeHandler}>
        <option value="0">Current Block</option>
        <option value="1">1 block ago</option>
        <option value="2">2 blocks ago</option>
        <option value="3">3 blocks ago</option>
      </select>
      <div className="App">Block Number: {blockNumber - selectedBlock}</div>
      <div>Miner Wallet: {minerWallet}</div>
      <div>Total Ether: {minerWalletAmountEther}</div>
      <ul>5 Recent Txns: {transactionsList}</ul>
      <h2>NFTs</h2>
      <label>Enter NFT contract addres</label>
      <form onSubmit={getNFTHandler} >
        <input type='text'></input>
        <button >Enter</button>
      </form>
      <div>{NFT.collectionUrl} {NFT.floorPrice} {NFT.priceCurrency}</div>

    </>
  )
}

export default App;
