// Controller of dashboard.
appControllers.controller('dashboardCtrl', function ($scope, $timeout, $state,$stateParams, $ionicHistory,$mdDialog, $http, $ionicLoading) {

    //$scope.isAnimated is the variable that use for receive object data from state params.
    //For enable/disable row animation.
    $scope.isAnimated =  $stateParams.isAnimated;

	// Chart data
    $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  	$scope.data = [300, 500, 100];
    $scope.form = {};

    // navigateTo is for navigate to other page
    // by using targetPage to be the destination state.
    // Parameter :
    // stateNames = target state to go.
    $scope.navigateTo = function (stateName,objectType, objectData) {
        console.log(objectData);
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

    $scope.test = function() {
      console.log("test");
    };


    $scope.addTransaction = function() {

       console.log("Amount:  " + $scope.form.amount);
       console.log("tx_type:  " + $stateParams.txtype);
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
    				"value" : $stateParams.txtype
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
    			headers: { 'Authorization': 'Basic ' + btoa('alex:b45k3t')},
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
            $scope.dialogResult = "You choose Confirm!"
        });
    };

    // Load funds for dropdown
    $scope.loadFunds = function() {

      	$http({
      		method : 'GET',
      		url : 'http://dev-project-midas.pantheonsite.io' + "/funds/list-autocomplete",
      		headers: { 'Authorization': 'Basic ' + btoa('alex:b45k3t')},
      		cache : true, // FIXME need to put an expiry to the cache somehow
      	}).then(function(response) {
      		$scope.loaded = true; // unload spinner
      		$scope.fundList = chunk(response.data, 2);
      	});
    };

}); // End of dashboard controller.

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
