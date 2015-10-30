angular.module('ionicApp', ['ionic', 'checklist-model', 'ngCordova', "firebase"])

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

.controller('AppCtrl', function ($scope, $cordovaToast, $rootScope, $state, consumirAPI, $cordovaGeolocation) {

    var token = $rootScope.token;
    var detener = false;

    $scope.sinSolicitudes = 'No hay solicitudes todavía';
    $scope.solicitudesPendientes = {};
    $scope.solicitudesEspera = {};
    $scope.solicitudesConfirmadas = {};

    $scope.ofertarSolicitud = function (id) {
        consumirAPI.ofertarSolicitud(id, token, function () {
            recargarSolicitudes(function () {});
        });
    }

    $scope.rechazarSolicitud = function (id) {
        consumirAPI.rechazarSolicitud(id, token, function () {
            recargarSolicitudes(function () {});
        });
    }

    $scope.entregarEnvio = function (id) {
        consumirAPI.entregarEnvio(id, token, function () {
            //navigator.geolocation.clearWatch(generarPosiciones);
            detener = true;
            recargarSolicitudes(function () {});
        });
    }

    $scope.recogerEnvio = function (id) {
        consumirAPI.recogerEnvio(id, token, function () {
            recargarSolicitudes(function () {});
        });
    }

    $scope.startTrip = function (viajeId, packeroId) {

        consumirAPI.iniciarViaje(viajeId, token, function (data) {

            console.log(data);

            recargarSolicitudes(function () {});

            var ref = new Firebase("https://packandpack.firebaseio.com/trips/" + viajeId + "/positions");
            ref.authWithCustomToken(data.token, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Login Succeeded!", authData);


                    navigator.geolocation.getCurrentPosition(function (pos) {
                            var lat = pos.coords.latitude;
                            var lng = pos.coords.longitude;
                            console.log(lat + ', ' + lng);
                            ref.push({
                                lat: lat,
                                lng: lng
                            });
                            navigator.geolocation.watchPosition(function (position) {
                                    lat = position.coords.latitude;
                                    lng = position.coords.longitude;
                                    /*ref.push({
                                        lat: lat,
                                        lng: lng
                                    });*/
                                },
                                function (error) {
                                    console.log(error.code + ', ' + error.message);
                                }, {
                                    maximumAge: 0,
                                    timeout: 5000,
                                    enableHighAccuracy: true
                                });

                            setInterval(function () {
                                if (!detener) {
                                    console.log(lat + ', ' + lng);
                                    ref.push({
                                        lat: lat,
                                        lng: lng
                                    });
                                }
                            }, 5000);


                        },
                        function (error) {
                            alert(error.code + ', ' + error.message);
                        }, {
                            maximumAge: 0,
                            timeout: 5000,
                            enableHighAccuracy: true
                        });

                }
            });
        });

    }

    recargarSolicitudes(function () {});

    function recargarSolicitudes(callback) {
        consumirAPI.obtenerSolicitudes(token, function (solicitudes) {
            if (solicitudes.length > 0) {
                $scope.sinSolicitudes = '';
            }

            var solicitudesPendientes = [];
            var solicitudesEspera = [];
            var solicitudesConfirmadas = [];
            for (var i = 0; i < solicitudes.length; i++) {
                //Detectar si es solicitud PENDIENTE con su status 10
                if (solicitudes[i].statusId == 10) {
                    //Agregar solicitudes pendientes
                    solicitudesPendientes.push(solicitudes[i]);
                }
                //Detectar si es solicitud en ESPERA con su status 20
                if (solicitudes[i].statusId == 20) {
                    //Agregar solicitudes en espera
                    solicitudesEspera.push(solicitudes[i]);
                }
                //Detectar si es solicitud CONFIRMADA con su status 30
                if (solicitudes[i].statusId == 30) {
                    //Agregar solicitudes confirmadas
                    solicitudesConfirmadas.push(solicitudes[i]);
                }
            }

            $scope.solicitudesPendientes = solicitudesPendientes;
            $scope.solicitudesEspera = solicitudesEspera;
            $scope.solicitudesConfirmadas = solicitudesConfirmadas;
            callback();
        });
    }

    $scope.doRefresh = function () {
        recargarSolicitudes(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
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
            consumirAPI.opcionViaje(260, 261, $scope.puebla.weekDays, token, function (id) {
                existePueblaMexico = true;
                opcionPueblaId = parseInt(id);
                alert("Guardado correctamente");
            });
        } else {
            consumirAPI.actualizarOpcionViaje(opcionPueblaId, 260, 261, $scope.puebla.weekDays, token);
        }

        //crear o actualizar México - Puebla
        if (!existeMexicoPuebla) {
            consumirAPI.opcionViaje(261, 260, $scope.mexico.weekDays, token, function (id) {
                existeMexicoPuebla = true;
                opcionMexicoId = parseInt(id);
                alert("Guardado correctamente");
            });
        } else {
            consumirAPI.actualizarOpcionViaje(opcionMexicoId, 261, 260, $scope.mexico.weekDays, token);
        }
    }
})



//creamos nuestro servicio
.service('consumirAPI', function ($http) {

    this.obtenerSolicitudes = function (token, callback) {
        $http.get('http://packandpack.com/api/packero/solicitudes?access_token=' + token)
            .then(function (response) {
                //Hacer algo con response
                callback(response.data);
            }, function (x) {
                //Error en x 
            });
    }

    this.ofertarSolicitud = function (id, token, callback) {
        $http.put('http://packandpack.com/api/packero/solicitudes?access_token=' + token, {
            id: id,
            status: 20
        }).then(function (response) {
                //Recargar solicitudes
                callback();
            },
            function (x) {
                //Error en x  
            });
    }

    this.rechazarSolicitud = function (id, token, callback) {
        $http.delete('http://packandpack.com/api/packero/solicitudes?id=' + id + '&access_token=' + token).then(function (response) {
                //Recargar solicitudes
                callback();
            },
            function (x) {
                //Error en x  
            });
    }


    this.opcionViaje = function (origenId, destinoId, weekDays, token, callback) {

        $http.post('http://packandpack.com/api/viajes/opciones?access_token=' + token, {
            origenId: origenId,
            destinoId: destinoId,
            weekDays: weekDays
        }).then(function (response) {
            // Hacer algo con response
            callback(response.data);
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
                    alert("El correo o la contraseña son incorrectos");
                } else {

                    //alert("Acceso correcto");
                    var token = response.data.access_token;
                    callback(token);
                }

            },
            function (x) {
                // Error de servidor
                alert("El correo o la contraseña son incorrectos");
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
            alert("Guardado correctamente");
        }, function (x) {
            // Error en x
        });
    }

    this.iniciarViaje = function (id, token, callback) {
        $http.put('http://packandpack.com/api/trips/' + id + '/start?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback(response.data);
            }, function (x) {
                // Error en x
            });
    }

    this.recogerEnvio = function (id, token, callback) {
        $http.put('http://packandpack.com/api/shipments/' + id + '/pick?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback();
            }, function (x) {
                // Error en x
            });
    }
    this.entregarEnvio = function (id, token, callback) {
        $http.put('http://packandpack.com/api/shipments/' + id + '/deliver?access_token=' + token)
            .then(function (response) {
                // Hacer algo con response
                callback();
            }, function (x) {
                // Error en x
            });
    }
});