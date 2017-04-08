appControllers
.service('auth',  authService);

// Controller of Dashboard Setting.
appControllers.controller('loginCtrl', ['auth', '$scope', '$http', '$state', '$ionicHistory', '$ionicViewSwitcher', '$cookies', '$location', function (auth, $scope, $http, $state,$ionicHistory,$ionicViewSwitcher, $cookies, $location) {
	

	$scope.form = {};
	
    $scope.login = function() {


    	console.log("Username: " + $scope.form.username);
    	console.log("Password: " + $scope.form.password);
		console.log(auth.isAuthed());

		if(!auth.isAuthed()) {

			$cookies.put('authString', btoa($scope.form.username + ":" + $scope.form.password));
			login($http, $scope.form.username, $scope.form.password, $cookies, $location, $scope);
		} else {
			$location.path('/app/dashboard');
		}

	};

	$scope.logout = function() {

		logout($http, $cookies, $location);
	};
}]); // End of Dashboard Setting controller.

// Login functions
function login($http, username, password, $cookies, $location,$scope) {
	$http({
		method : 'POST',
		url : 'http://dev-project-midas.pantheonsite.io' + '/user/login?_format=json',
		data : {
			name : username,
			pass : password
		}
	}).then(function(res) {
	
		console.log("Login authString: " + btoa(username + ":" + password));
		console.log(res);
		$cookies.put('userId', res.data.current_user.uid);
		$cookies.put('authString', btoa(username + ":" + password));
		// TODO temp workaround to get the latest session token
		getToken($cookies) ;
		getUserDetails($http, $cookies, res.data.current_user.uid);
		// if successful, redirect to homepage
		$location.path('/app/dashboard');
	});
}

// Logout function
function logout($http, $cookies, $location) {
	console.log("Logout successful ");
	$cookies.remove('sessionToken');
	$cookies.remove('authString');
	$cookies.remove('userId');
	$cookies.remove('userProfilePic');
	$cookies.remove('userProfileName');

		 $.ajax({
			 method: 'GET',
			 url: 'http://dev-project-midas.pantheonsite.io' + '/user/logout',
			 async: false,
			 headers: {
			 'Content-Type': 'text/html',
			 'X-CSRF-TOKEN': $cookies.get('sessionToken')
		 },
		 success : function(response) {
			 console.log("Logout successful ");
			 $cookies.remove('sessionToken');
			 $cookies.remove('authString');
			 $cookies.remove('userId');
			 $cookies.remove('userProfilePic');
			 $cookies.remove('userProfileName');
			 $location.path('/app/login');
		 },
		 error : function(response) {
		 	console.log("Error logging out");
			$location.path('/app/login');
		 }
	 });

}

function getToken($cookies) {
	$.ajax({
			type : 'GET',
			url : 'http://dev-project-midas.pantheonsite.io' + "/rest/session/token",
			async : false,
			success : function(response) {
				$cookies.put('sessionToken', response);
				console.log("Login successful: " + response);
			},
			error : function(response) {
				console.log("Can't get token");
			}
		});
}

function getUserDetails($http, uid) {
	$http({
		method : 'GET',
		url : 'http://dev-project-midas.pantheonsite.io' + '/user/' +uid + '?format=json'
	}).then(function(res) {
		$cookies.put("clientId", data.field_client_ref.target_id);
		console.log("CLient ID: " + $cookies.get("clientId"));
	});
}
