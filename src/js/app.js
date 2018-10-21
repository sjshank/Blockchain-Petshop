App = {
    web3Provider : null,
    contracts : {},

    // loading pet data
    init: function(){
        $.getJSON("../pet.json", function(data){
            var petsRow = $('#petsRow');
            var petTemplate = $('#petTemplate');

            for (i = 0; i < data.length; i ++) {
                petTemplate.find('.panel-title').text(data[i].name);
                petTemplate.find('img').attr('src', data[i].picture);
                petTemplate.find('.pet-breed').text(data[i].breed);
                petTemplate.find('.pet-age').text(data[i].age);
                petTemplate.find('.pet-location').text(data[i].location);
                petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

                petsRow.append(petTemplate.html());
            }
        });
        // initializing web3 object
        App.initWeb3();
    },

    initWeb3 : function(){
        // we check if there's a web3 instance already active. If an injected web3 instance is present, 
        // we get its provider and use it to create our web3 object.
        if(typeof web3 !== 'undefined'){
            App.web3Provider = web3.currentProvider;
        }else{
            //If no injected web3 instance is present, we create our web3 object based on our local provider. 
            // (This fallback is fine for development environments, but insecure and not suitable for production.)
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        // create our web3 object.
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },


    /**Things to notice:

        We first retrieve the artifact file for our smart contract. 
        Artifacts are information about our contract such as its deployed address and Application Binary Interface (ABI). 
        The ABI is a JavaScript object defining how to interact with the contract including its variables, functions and their parameters.

        Once we have the artifacts in our callback, we pass them to TruffleContract(). 
        This creates an instance of the contract we can interact with.

        With our contract instantiated, we set its web3 provider using the App.web3Provider value we stored earlier when setting up web3.

        We then call the app's markAdopted() function in case any pets are already adopted from a previous visit. 
        We've encapsulated this in a separate function since we'll need to update the UI any time we make a change to the smart contract's data.
    **/
    initContract : function(){
        $.getJSON("Adoption.json", function(data){
            // 
            var AdoptionArtifact = data;
            App.contracts.Adoption = TruffleContract(AdoptionArtifact);

            App.contracts.Adoption.setProvider(App.web3Provider);

            var adoptionInstance;

            App.contracts.Adoption.deployed()
                .then(function(inst){
                    adoptionInstance = inst;

                return adoptionInstance.getAdopters.call();
            }).then(function(adopters){
                for (i = 0; i < adopters.length; i++) {
                    if (!adopters[i]) {
                      $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
                    }
                }
                App.bindEvents();
            }).catch(function(err){
                console.error("----Error----", err);
            })
                
        })
    },

    bindEvents: function() {
        $(document).on('click', '.btn-adopt', App.handleAdopt);
    },

    handleAdopt: function(e){
        e.preventDefault();
        var petId = parseInt($(event.target).data('id'));

        var adoptionInstance;

        web3.eth.getAccounts(function(err, accounts){
            if(err){
                console.error("----Error----", err);
            }

        var acc = accounts[0];

        App.contracts.Adoption.deployed()
            .then(function(inst){
                adoptionInstance = inst;
                return adoptionInstance.adoptPet(petId, {from: acc});
            })
            .then(function(result){
                console.log("----Success---", result);
            })
            .catch(function(err){
                console.error("----Error----", err);
            })
        });
    }
};

$(function() {
    $(window).load(function() {
      App.init();
    });
  });
