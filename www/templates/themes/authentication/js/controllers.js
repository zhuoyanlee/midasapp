
// Controller of Dashboard Setting.
appControllers.controller('loginCtrl', function (auth, $scope, $http,$ionicHistory,$ionicViewSwitcher, $state, $localStorage, endpoint) {
	

	$scope.form = {};
	
    $scope.login = function() {

		
    	console.log("Username: " + $scope.form.username);
    	console.log("Password: " + $scope.form.password);
		console.log(auth.isAuthed());

		if(!auth.isAuthed()) {
			$localStorage.authString = btoa($scope.form.username + ":" + $scope.form.password);
			// $scope.$evalAsync(function(){
				login($http, $scope.form.username, $scope.form.password, $localStorage, $state, $scope, endpoint);
			// });
		} else {
			$state.go("app.dashboard");
		}

		//$state.go("app.dashboard"); //path('/app/dashboard');
	};

	$scope.logout = function() {

		logout($http, $localStorage, $state);
	};
}); // End of Dashboard Setting controller.

// Login functions
function login($http, username, password, $localStorage, $state,$scope, endpoint) {
	$http({
		method : 'POST',
		url : endpoint + '/user/login?_format=json',
		data : {
			name : username,
			pass : password
		}
	}).then(function(res) {
	
		console.log("Login authString: " + btoa(username + ":" + password));
		console.log(res);
		$localStorage.userId = res.data.current_user.uid;
		$localStorage.authString= btoa(username + ":" + password);
		// TODO temp workaround to get the latest session token
		
		getToken($localStorage) ;
		getUserDetails($http, $localStorage, res.data.current_user.uid).then(function(){
			$state.go("app.dashboard");
		});
		// if successful, redirect to homepage
		// $scope.$evalAsync(function(){

		// });
	
	});
}

// Logout function
function logout($http, $localStorage, $state) {
	console.log("Logout successful ");
	

		 $.ajax({
			 method: 'GET',
			 url: 'http://dev-project-midas.pantheonsite.io' + '/user/logout',
			 async: false,
			 headers: {
			 'Content-Type': 'text/html',
			 'X-CSRF-TOKEN': $localStorage.sessionToken
		 },
		 success : function(response) {
			 console.log("Logout successful ");
			
			delete $localStorage.sessionToken;
			delete $localStorage.authString;
			delete $localStorage.userId;
			delete $localStorage.userProfilePic;
			delete $localStorage.userProfileName;
			
			 $location.path('/app/login');
		 },
		 error : function(response) {
		 	console.log("Error logging out");
			$state.go("app.login");
		 }
	 });

}

function getToken($localStorage) {
	$.ajax({
			type : 'GET',
			url : 'http://dev-project-midas.pantheonsite.io' + "/rest/session/token",
			async : false,
			success : function(response) {
				$localStorage.sessionToken= response;
				console.log("Login successful: " + response);
			},
			error : function(response) {
				console.log("Can't get token");
			}
		});
}

function getUserDetails($http, $localStorage, uid) {
	return $http({
		method : 'GET',
		headers: { 'Authorization': 'Basic ' + $localStorage.authString},
		url : 'http://dev-project-midas.pantheonsite.io' + '/user/' +uid + '?_format=json'
	}).then(function(res) {
		console.log(res.data);
		$localStorage.clientId = res.data.field_client_ref[0].target_id;
		console.log("CLient ID: " + $localStorage.clientId);
	});
}
