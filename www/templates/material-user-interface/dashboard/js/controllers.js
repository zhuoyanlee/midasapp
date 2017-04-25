// Controller of dashboard.
appControllers.controller('dashboardCtrl', ['auth', 'client', '$scope', '$localStorage', '$timeout', '$state', '$stateParams', '$ionicHistory','$mdDialog', '$http', '$ionicLoading', '$location', 'endpoint', function (auth, clientService, $scope, $localStorage, $timeout, $state,$stateParams, $ionicHistory,$mdDialog, $http, $ionicLoading, $location, endpoint) {

    //$scope.isAnimated is the variable that use for receive object data from state params.
    //For enable/disable row animation.
    $scope.isAnimated =  $stateParams.isAnimated;

	// Chart data
   
    $scope.form = {};
	console.log("endpoint: " + endpoint);
	
	$scope.loadPortfolio = function () {
		
		if(!auth.isAuthed()) {
			$state.go("app.login");
		} else {
			$scope.loaded = false;
			console.log("user is authenticated: " + $localStorage.clientId);
			
	  		getClientDetails() ;
	  		clientService.getClientInvestmentBreakdown($scope);
		}
	};
	
	// Get client details
	getClientDetails = function() {

			$http({
				method : 'GET',
				headers: { 'Authorization': 'Basic ' + $localStorage.authString},
				url : endpoint + "/client/" + $localStorage.clientId
			}).then(function(response) {
				if (response.data && response.data.length > 0) {

					$scope.client = response.data[0];

					// If no images uploaded, put placeholder image depending on gender
					if(typeof $scope.client.field_photo == 'undefined' || $scope.client.field_photo == ""){
						console.log("URI is undefined");
						if ($scope.client.field_gender && $scope.client.field_gender == "female") {
							$scope.client.field_photo = "http://kcwebmarketing.com/wp-content/uploads/avatar-6.png";
						} else if ($scope.client.field_gender && $scope.client.field_gender == "male") {
							$scope.client.field_photo = "https://www.gorillacircuits.com/wp-content/uploads/2016/01/avatar_placeholder.png";
						} else {
							$scope.client.field_photo = "https://www.gorillacircuits.com/wp-content/uploads/2016/01/avatar_placeholder.png";
						}
					}
					console.log($scope.client);

				} else {
					console.log('Client not found');
				}
				$scope.loaded = true; // unload spinner
			});
		
	};
	
	

    // navigateTo is for navigate to other page
    // by using targetPage to be the destination state.
    // Parameter :
    // stateNames = target state to go.
    $scope.navigateTo = function (stateName,objectType, objectData) {
    	
        if(objectType=='txtype') {$scope.txtype = objectData;}
        if(objectType=='fundtype') {$scope.fund = objectData;}

        $timeout(function () {
            if ($ionicHistory.currentStateName() != stateName) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: false
                });
                if(objectType=='txtype') {$state.go(stateName, {'txtype':objectData});}
                else if(objectType=='fundSelected') {$state.go(stateName, {'fundSelected':objectData, 'txtype':$stateParams.txtype});}
                else {$state.go(stateName);}
            }
        }, ($scope.isAnimated  ? 300 : 0));

        console.log("navigate stateParams txtype: " + $stateParams.txtype);
    }; // End of navigateTo.

    // goToSetting is for navigate to Dashboard Setting page
    $scope.goToSetting = function () {
        $state.go("app.dashboardSetting");
    };// End goToSetting.

    // $scope.clientDetails = function(){
// 
	  	// clientService.getClientDetails() ;
// 
		// $scope.totalInitialInvestment = parseInt(0);
// 
	// };
	
    $scope.addTransaction = function() {
		
	   var txtype = $stateParams.txtype;
	   
	   // When txtype is not set, default to 'sell'
	   if(txtype == '') {
			txtype='sell';
			console.log('txtype has been defaulted to sell');
			
		}
       console.log("Amount:  " + $scope.form.amount);
       console.log("tx_type:  " + txtype);
       console.log("units:  " + $scope.form.units);
       console.log("fundDtls:  " + $stateParams.fundSelected);

    		//var transact_date = formatDateString($scope.transact_date);
        $ionicLoading.show({
	      template: 'Loading...'
	    }).then(function(){
	       console.log("The loading indicator is now displayed");
	    });


		var package = {
			"type" : [{
				"target_id" : "transaction"
			}],
			"title" : [{
				"value" : "test from mobile"
			}],
			"field_amount" : [{
				"value" : $scope.form.amount
			}],
			"field_transaction_date" : [{
				"value" : '2017-01-01'
			}],
			"field_client" : [{
				"target_id" : '282'
			}],
			"field_transaction_type" : [{
				"value" : txtype
			}],
			"field_number_of_units" : [{
				"value" : $scope.form.units
			}],
			"field_fund" : [{
				"target_id" : $stateParams.fundSelected
			}]
		};

		$http({
			method : 'POST',
			url : 'http://dev-project-midas.pantheonsite.io' + '/entity/node',
			data : package
		}).then(function(data) {
			console.log("Transaction Successfully created");
            $ionicLoading.hide();
	        $scope.navigateTo("app.txsuccess",null,null);
		});
    };

    $scope.addTransDialog = function ($event) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Alert dialog !!",
                    content: "Alert dialog",
                    ok: "Confirm",
                    cancel: "Close"
                }
            }
        }).then(function () {
            $scope.dialogResult = "You choose Confirm!";
        });
    };

    // Load funds for dropdown
    // $scope.loadFunds = function() {
// 		
      	// clientService.loadFunds($scope);
    // };
//     
    $scope.clientOpenPositions = function() {
    	clientService.loadClientOpenPositions($scope);
    };

}]); // End of dashboard controller.

// Controller of Dashboard Setting.
appControllers.controller('dashboardSettingCtrl', function ($scope, $state,$ionicHistory,$ionicViewSwitcher) {

    // navigateTo is for navigate to other page
    // by using targetPage to be the destination state.
    // Parameter :
    // stateNames = target state to go.
    // objectData = Object data will send to destination state.
    $scope.navigateTo = function (stateName,objectData) {
            if ($ionicHistory.currentStateName() != stateName) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true
                });

                //Next view animate will display in back direction
                $ionicViewSwitcher.nextDirection('back');

                $state.go(stateName, {
                    isAnimated: objectData,
                });
            }
    }; // End of navigateTo.
}); // End of Dashboard Setting controller.
/*
appControllers.service('user', userService)
.service('auth',  authService);*/
