define( ["qlik", "text!./template.html"],
	function ( qlik, template ) {
		return {
			template: template,
			support: {
				snapshot: true,
				export: true,
				exportData: false
			},
			paint: function () {
				if(!this.$scope.layout.qHyperCube.qDataPages[0]) return;
				var xScale = Math.max(Math.abs(this.$scope.layout.qHyperCube.qMeasureInfo[0].qMin), Math.abs(this.$scope.layout.qHyperCube.qMeasureInfo[0].qMax));
				var yScale = Math.max(Math.abs(this.$scope.layout.qHyperCube.qMeasureInfo[1].qMin), Math.abs(this.$scope.layout.qHyperCube.qMeasureInfo[1].qMax));
				var sizeScale = this.$scope.layout.qHyperCube.qMeasureInfo[2].qMax;
				var nDim = this.$scope.layout.qHyperCube.qDimensionInfo.length;
				var nodeMap = {};
				this.$scope.dots = 
					this.$scope.layout.qHyperCube.qDataPages[0].qMatrix
					.map(function(row, index) {
						return nodeMap[row[0].qText] = {
							index: index,
							selDim: row[0].qElemNumber,
							connectTo: row[1].qText,
							x: row[nDim + 0].qNum/xScale * 80,
							y: row[nDim + 1].qNum/yScale * 80,
							size: 5+(row[nDim + 2].qNum)/sizeScale * 10,
							text: row[nDim + 2].qText,
							color: row[nDim+4]===undefined?"black":row[nDim+4].qText,
							state: row[0].qState
						};
					})
				
				this.$scope.lines = this.$scope.dots
					.filter(function(dot) {return !!nodeMap[dot.connectTo];})
					.map(function(dot) {
						return {
							x1: dot.x,
							y1: dot.y,
							x2: nodeMap[dot.connectTo].x,
							y2: nodeMap[dot.connectTo].y
						}
					});
				return qlik.Promise.resolve();
			},
			controller: ['$scope', function ( $scope ) {
				this.$scope = $scope;
				var ctrl = this;
				$scope.dots = [];		
				$scope.lines = [];
				$scope.select = function(val){
					val.state = 'PS';
					$scope.selectValues(0, [val.selDim], true);
				}
				
			}],
			initialProperties: {
				qHyperCubeDef: {
					qInitialDataFetch:  [{qTop :0, qLeft : 0, qWidth : 7, qHeight: 1000}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					txt1: {
						label: 'Help',
						items: {
							ll: {label: "Add dimensions:", component: "text"},
							ll1: {label: "1 - node ID", component: "text"},
							ll2: {label: "2 - connect to node ID", component: "text"},
							l2: {label: "Add measures:", component: "text"},
							l3: {label: "1 - X coordinate (will be normalized)", component: "text"},
							l4: {label: "2 - Y coordinate (will be normalized)", component: "text"},
							l5: {label: "3 - Size factor (will be normalized)", component: "text"},
							l6: {label: "4 - text", component: "text"},
							l7: {label: "5 - color (hex, rgb or name)", component: "text"}
						},
					},
					data: {
						type: "items",
						label: "Data",
						items: {
							dimensions: {
								uses: "dimensions",
								min: 2,
								max: 2, 
							},
							measures: {
								uses: "measures", // x,y,size,color,text
								min: 2,
								max: 5
							},
						}
					},
					sorting: {
						uses: "sorting"
					},
					addons: {
						uses: "addons",
						items: {  
						  dataHandling: {  
						   uses: "dataHandling"  
						  }  
						}  
					}				
				}
			}
		};

	} );

