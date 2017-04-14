// Controller of dashboard.
appControllers.controller('dashboardCtrl', function (auth,$scope, $cookies, $timeout, $state,$stateParams, $ionicHistory,$mdDialog, $http, $ionicLoading, $location, endpoint) {

    //$scope.isAnimated is the variable that use for receive object data from state params.
    //For enable/disable row animation.
    $scope.isAnimated =  $stateParams.isAnimated;

	// Chart data
   
    $scope.form = {};
	console.log("endpoint: " + endpoint);
	
	$scope.loadPortfolio = function () {
		if(!auth.isAuthed()) {
			$location.path('/app/login');
		} else {
			console.log("user is authenticated: " + $cookies.get('clientId'));
			
	  		getClientDetails() ;
	  		getClientInvestmentBreakdown(endpoint, $cookies.get('clientId'));
		}
	};
	
	// Get client details
	getClientDetails = function() {

			$http({
				method : 'GET',
				headers: { 'Authorization': 'Basic ' + $cookies.get('authString')},
				url : endpoint + "/client/" + $cookies.get('clientId')
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
					
					$location.path('/clients');
				}
			});
		
	};
	
	// Get Client's portfolio chart breakdown
	getClientInvestmentBreakdown = function() {

		// Initialise total investment to zero
		$scope.totalInvestment = 0;
	
		// Initialise fund allocation to new Array();
		$scope.fundAllocation = new Array();
	
		var doughnut_colors = ['#2A3F54', '#26B99A', '#E74C3C', '#3498DB', '#BDC3C7', '#9B59B6'];
	
		$http({
			method : 'GET',
			url : endpoint + "/client/" + $cookies.get('clientId') + "/funds"
		}).then(function(response) {
			$scope.totalInitialInvestment=0;
			$scope.totalInvestment = 0;
			if (response.data && response.data.length > 0) {
				var data_array = new Array();
				var title_array = new Array();
				var color_array = new Array();
	
				var fund_breakdown = {};
				var average_purchase_price = {};
	
				for (var i = 0; i < response.data.length; i++) {
	
					if(response.data[i].field_number_of_units<=0){
						continue;
					}
					// $scope.totalInitialInvestment = parseFloat($scope.totalInitialInvestment,2) +(parseFloat(response.data[i].field_number_of_units,3)*parseFloat(response.data[i].average_price,3));
					var currentValue = response.data[i].field_number_of_units * response.data[i].field_last_price;
	
					if (response.data[i].field_transaction_type == 'sell') {
	
						$scope.totalInitialInvestment -= response.data[i].field_number_of_units * average_purchase_price[response.data[i].nid];
						$scope.totalInvestment -= currentValue;
	
						// Adjust the fund allocation amount if there was a sell transaction
						var index = $scope.fundAllocation.indexOf(fund_breakdown);
						$scope.fundAllocation[index].field_amount -= currentValue;
	
						// Update the value on the data array for chart
						data_array[index] =  $scope.fundAllocation[index].field_amount;
	
						if ($scope.fundAllocation[index].field_amount <= 0) {
							$scope.fundAllocation.splice(index);
							data_array.splice(index);
							title_array.splice(index);
							color_array.splice(index);
						}
	
					} else {
	
						average_purchase_price[response.data[i].nid] = response.data[i].field_amount / response.data[i].field_number_of_units;
						$scope.totalInitialInvestment += parseFloat(response.data[i].field_amount);
						$scope.totalInvestment += currentValue;
	
						data_array.push(currentValue.toFixed(0));
						title_array.push((response.data[i].field_fund));
						fund_breakdown = {};
						fund_breakdown.field_amount = currentValue.toFixed(0);
						fund_breakdown.field_fund = response.data[i].field_fund;
						fund_breakdown.color = doughnut_colors[$scope.fundAllocation.length];
						color_array.push(doughnut_colors[$scope.fundAllocation.length]);
						fund_breakdown.$$hashKey = response.data[i].field_transaction_type + ":" + response.data[i].nid;
	
						$scope.fundAllocation.push(fund_breakdown);
					}
					// color_array[i] = doughnut_colors[i];
					response.data[i].color = color_array[i];
	
				}
	
				$scope.data = data_array;
				$scope.labels = title_array;
				$scope.chart_colors = color_array;
	
				// Work out client's profit/loss percentage $scope.diff used to display
				if ($scope.totalInitialInvestment == 0) {
					$scope.diff = 0;
				} else {
					$scope.diff = (($scope.totalInvestment - $scope.totalInitialInvestment) / $scope.totalInitialInvestment * 100).toFixed(2);
				}
	
				if ($scope.diff >= 0) {
					$scope.profitLoss = '<i class="green"><i class="fa fa-sort-asc"></i> ' + $scope.diff + '% </i>';
				} else {
					$scope.profitLoss = '<i class="red"><i class="fa fa-sort-desc"></i> ' + Math.abs($scope.diff) + '% </i>';
				}
	
				
			}
		});
	
	};

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

    $scope.clientDetails = function(){

		

	  	clientService.getClientDetails() ;


		$scope.totalInitialInvestment = parseInt(0);

	
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
