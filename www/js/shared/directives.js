//Directive numbersOnly :
//Use for change input to have ability accept only number.
//Example : <input ng-model="contract.age" numbers-only type="tel">
//
appControllers.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});// End Directive numbersOnly.

appControllers
    .directive('formValidateAfter', formValidateAfter);

function formValidateAfter() {
    var directive = {
        restrict: 'A',
        require: 'ngModel',
        link: link
    };

    return directive;

    function link(scope, element, attrs, ctrl) {
        var validateClass = 'form-validate';
        ctrl.validate = false;
        element.bind('focus', function (evt) {
            if (ctrl.validate && ctrl.$invalid) // if we focus and the field was invalid, keep the validation
            {
                element.addClass(validateClass);
                scope.$apply(function () { ctrl.validate = true; });
            }
            else {
                element.removeClass(validateClass);
                scope.$apply(function () { ctrl.validate = false; });
            }

        }).bind('blur', function (evt) {
            element.addClass(validateClass);
            scope.$apply(function () { ctrl.validate = true; });
        });
    }
}
