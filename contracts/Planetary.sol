// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Planetary is ERC721, ERC721URIStorage {
  constructor() ERC721("Planetary", "PLNT") {
    _createPlanet(msg.sender, 1, "QmcGByRh3dYoZA8av3CmErhmeEFiERzGYzfQ7iBqU1hb5G");
    _createPlanet(msg.sender, 2, "QmbxbvrQCV8cmX8wuQc8UrNUxTpiFzeopezdMEG5ymdvzM");
    _createPlanet(msg.sender, 3, "QmRVoeVyy7qdxxvrgJXeC4omJBwF49hNEhQmda4bEzL87Q");
    _createPlanet(msg.sender, 4, "QmcaB78qNBwu8BjLJ8css95j1r3GQvfGmV5dh4n3kBstVz");
    _createPlanet(msg.sender, 5, "QmP7HXPekgWTAa3vss8NPGuqimC8oooh6rfHBxRydLuH6Z");
  }

  function _createPlanet(address to, uint id, string memory url) private returns (bool) {
    _safeMint(to, id);
    _setTokenURI(id, url);
    return true;
  }

  function _baseURI() internal pure override returns (string memory) {
    return "https://ipfs.io/ipfs/";
  }

  // The following functions are overrides required by Solidity.
  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
  public
  view
  override(ERC721, ERC721URIStorage)
  returns (string memory)
  {
    return super.tokenURI(tokenId);
  }
}