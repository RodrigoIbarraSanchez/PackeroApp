angular.module('ionicApp', ['ionic', 'checklist-model'])

.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('signin', {
            url: '/sign-in',
            templateUrl: 'templates/sign-in.html',
            controller: 'SignInCtrl'
        })
        .state('forgotpassword', {
            url: '/forgot-password',
            templateUrl: 'templates/forgot-password.html'
        })
        .state('tabs', {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        })
        .state('tabs.envios', {
            url: '/envios',
            views: {
                'envios-tab': {
                    templateUrl: 'templates/envios.html',
                    controller: 'HomeTabCtrl'
                }
            }
        })
        .state('tabs.viajes', {
            url: '/viajes',
            views: {
                'viajes-tab': {
                    templateUrl: 'templates/viajes.html'
                }
            }
        });


    $urlRouterProvider.otherwise('/sign-in');

})

.controller('SignInCtrl', function ($scope, $rootScope, $state, consumirAPI) {

    $scope.signIn = function (email, pass) {
        consumirAPI.signIn(email, pass, function (token) {
            $rootScope.token = token;
            $state.go('tabs.envios');
        });
    };

})

.controller('HomeTabCtrl', function ($scope, $rootScope, consumirAPI) {
    console.log('HomeTabCtrl');
    var token = $rootScope.token;
    var existePueblaMexico = false;
    var existeMexicoPuebla = false;
    var opcionPueblaId = 0;
    var opcionMexicoId = 0;

    $scope.weekDayLabels = [
        'Lu',
        'Ma',
        'Mi',
        'Ju',
        'Vi',
        'Sa',
        'Do'
    ];

    $scope.puebla = {
        weekDays: []
    };

    $scope.mexico = {
        weekDays: []
    };

    consumirAPI.obtenerOpcionesViaje(token, function (opcionesViaje) {
        //Recorrer todas las opciones
        for (var i = 0; i < opcionesViaje.length; i++) {
            //Detectar origen-destino
            if (opcionesViaje[i].origenId == 260 && opcionesViaje[i].destinoId == 261) {
                //caso Puebla a DF
                existePueblaMexico = true;
                opcionPueblaId = opcionesViaje[i].id;
                var weekDays = [];
                for (var w = 0; w < opcionesViaje[i].weekDays.length; w++) {
                    weekDays[w] = parseInt(opcionesViaje[i].weekDays[w]);
                }
                $scope.puebla['weekDays'] = weekDays;
            } else if (opcionesViaje[i].origenId == 261 && opcionesViaje[i].destinoId == 260) {
                //caso DF a Puebla
                existeMexicoPuebla = true;
                opcionMexicoId = opcionesViaje[i].id;
                var weekDays = [];
                for (var w = 0; w < opcionesViaje[i].weekDays.length; w++) {
                    weekDays[w] = parseInt(opcionesViaje[i].weekDays[w]);
                }
                $scope.mexico['weekDays'] = weekDays;
            }
        }
    });

    $scope.guardarOpciones = function () {

        //crear o actualizar Puebla - México
        if (!existePueblaMexico) {
            consumirAPI.opcionViaje(260, 261, $scope.puebla.weekDays, token);
        } else {
            consumirAPI.actualizarOpcionViaje(opcionPueblaId, 260, 261, $scope.puebla.weekDays, token);
        }

        //crear o actualizar México - Puebla
        if (!existeMexicoPuebla) {
            consumirAPI.opcionViaje(261, 260, $scope.mexico.weekDays, token);
        } else {
            consumirAPI.actualizarOpcionViaje(opcionMexicoId, 261, 260, $scope.mexico.weekDays, token);
        }
    }

})

//creamos nuestro servicio
.service('consumirAPI', function ($http) {


    this.opcionViaje = function (origenId, destinoId, weekDays, token) {

        $http.post('http://packandpack.com/api/viajes/opciones?access_token=' + token, {
            origenId: origenId,
            destinoId: destinoId,
            weekDays: weekDays
        }).then(function (response) {
            // Hacer algo con response
        }, function (x) {
            // Error en x
        });


        return true;
    }

    this.signIn = function (email, pass, callback) {
        $http.post("http://packandpack.com/oauth/v2/token", {
            grant_type: "password",
            client_id: "1_3bcbxd9e24g0gk4swg0kwgcwg4o8k8g4g888kwc44gcc0gwwk4",
            client_secret: "4ok2x70rlfokc8g0wws8c8kwcokw80k44sg48goc0ok4w0so0k",
            username: email,
            password: pass
        }).then(function (response) {

                if (!response.data.access_token) {
                    // Error de acceso
                    alert("El correo o la contraseña son incorrectos " + JSON.stringify(response));
                } else {

                    alert("Acceso correcto");
                    var token = response.data.access_token;
                    callback(token);
                }

            },
            function (x) {
                // Error de servidor
                alert("Error de servidor " + x);
            });
    }

    this.obtenerOpcionesViaje = function (token, callback) {
        $http.get('http://packandpack.com/api/viajes/opciones?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback(response.data);
            }, function (x) {
                // Error en x
            });
    }

    this.actualizarOpcionViaje = function (id, origenId, destinoId, weekDays, token) {
        $http.put('http://packandpack.com/api/viajes/opciones?access_token=' + token, {
            id: id,
            origenId: origenId,
            destinoId: destinoId,
            weekDays: weekDays
        }).then(function (response) {
            // Hacer algo con response
            alert("se hizo put satisfactorio");
        }, function (x) {
            // Error en x
        });
    }
});