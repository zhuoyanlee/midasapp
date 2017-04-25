function authService($http, $localStorage) {
	var self = this;

	self.isAuthed = function() {
		console.log("Auth String: " + $localStorage.authString);

		if ($localStorage.authString && $localStorage.authString.length > 0 && $localStorage.sessionToken && $localStorage.sessionToken.length > 0) {
			return true;
		} else {
			return false;
		}

	};

}

function clientService($http, $localStorage, endpoint) {
	var self = this;
	
	// Get Client's portfolio chart breakdown
	self.getClientInvestmentBreakdown = function($scope) {

		// Initialise total investment to zero
		$scope.totalInvestment = 0;
	
		// Initialise fund allocation to new Array();
		$scope.fundAllocation = new Array();
	
		var doughnut_colors = ['#2A3F54', '#26B99A', '#E74C3C', '#3498DB', '#BDC3C7', '#9B59B6'];
	
		$http({
			method : 'GET',
			url : endpoint + "/client/" + $localStorage.clientId + "/funds"
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
						fund_breakdown.fund_id = response.data[i].nid;
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
	
				self.clientFundAllocation = $scope.fundAllocation;
				
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
	
	// Load funds for dropdown
    self.loadFunds = function($scope) {
      	$http({
      		method : 'GET',
      		url : endpoint + "/funds/list-autocomplete",
      		cache : true, // FIXME need to put an expiry to the cache somehow
      	}).then(function(response) {
      		$scope.loaded = true; // unload spinner
      		$scope.fundList = chunk(response.data, 2);
      	});
    };
    
    self.loadClientOpenPositions = function($scope) {
    	    	
		console.log(self.clientFundAllocation);
		
		$scope.clientFundAllocation = self.clientFundAllocation;
    };
}

function authInterceptor($localStorage) {

	return {
		// automatically attach Authorization header
		'request' : function(req) {
			if (req.url.indexOf("/user/l") <= 0 && req.url.indexOf("https://safe-temple-72604.herokuapp.com")<=0 && $localStorage.authString) {
				console.log("Inserting Basic authentication header");
				req.headers.Authorization = 'Basic ' + $localStorage.authString;

			}
			return req;
		},
		'response' : function(res) {
			return res;
		},
		// If a http error 403(forbidden) or 401(unauthorised) occurs, redirect to login screen
		'responseError' : function(res) {
			console.log("error status: " + res.status);

			if (res.status == "403" || res.status == "401") {
				console.log("Unauthorized or Forbidden");
				

			}


			return res;
		},
	};
}