angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CityController.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete City? This action cannot be undone.',
			deleteTitle: 'Delete City?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-sample-csvim:sample-model.defaults.yes');
			translated.no = LocaleService.t('codbex-sample-csvim:sample-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-sample-csvim:sample-model.defaults.deleteTitle', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
			translated.deleteConfirm = LocaleService.t('codbex-sample-csvim:sample-model.messages.deleteConfirm', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
		});

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-csvim-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Entities' && e.view === 'City' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Entities' && e.view === 'City' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.Entities.City.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.Entities.City.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.Entities.City.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					if (!filter.$filter) {
						filter.$filter = {};
					}
					filter.$filter.offset = offset;
					filter.$filter.limit = limit;
					request = EntityService.search(filter);
				} else {
					request = EntityService.list(offset, limit);
				}
				request.then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
						message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToLF', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCount', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'City-details',
				params: {
					action: 'select',
					entity: entity,
					optionsCountry: $scope.optionsCountry,
				},
				closeButton: true,
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'City-filter',
				params: {
					entity: $scope.filterEntity,
					optionsCountry: $scope.optionsCountry,
				},
				closeButton: true,
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'City-details',
				params: {
					action: 'create',
					entity: {},
					optionsCountry: $scope.optionsCountry,
				},
				closeButton: false,
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'City-details',
				params: {
					action: 'update',
					entity: entity,
					optionsCountry: $scope.optionsCountry,
				},
				closeButton: false,
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}]
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then((response) => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-sample-csvim.Entities.City.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
							message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToDelete', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsCountry = [];


		$http.get('/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CountryController.ts').then((response) => {
			$scope.optionsCountry = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Country',
				message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsCountryValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsCountry.length; i++) {
				if ($scope.optionsCountry[i].value === optionKey) {
					return $scope.optionsCountry[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	});