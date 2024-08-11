// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract VRNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable, ERC721Burnable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenImageURIs;

    constructor(address initialOwner)
        ERC721("VRNFT", "VRN")
        Ownable(initialOwner)
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory uri, string memory imgUri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _setTokenImageURI(tokenId, imgUri);
    }

    function _setTokenImageURI(uint256 tokenId, string memory imgUri) internal virtual {
        _tokenImageURIs[tokenId] = imgUri;
    }

    function tokenImageURI(uint256 tokenId) public view returns (string memory) {
        return _tokenImageURIs[tokenId];
    }

    function getAllTokens() public view returns (uint256[] memory, string[] memory, string[] memory) {
        uint256 totalTokens = _nextTokenId;
        uint256[] memory tokenIds = new uint256[](totalTokens);
        string[] memory uris = new string[](totalTokens);
        string[] memory imgUris = new string[](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            tokenIds[i] = i;
            uris[i] = tokenURI(i);
            imgUris[i] = tokenImageURI(i);
        }

        return (tokenIds, uris, imgUris);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
