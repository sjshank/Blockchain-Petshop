pragma solidity ^0.4.24;

contract Adoption{
    address[16] public adopters;

    function adoptPet(uint petId) public  returns(uint){
        // Validator. require() statement to ensure the ID is within range
        require(
            petId >= 0 && petId <= 15,
            "Pet id between 0 to 15 are acceptable."
        );

        adopters[petId] = msg.sender;

        return petId;
    }

    function getAdopters() public view returns(address[16]) {
        return adopters;
    }
}