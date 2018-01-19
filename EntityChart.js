function initChart(host) {
    //init chart model here
    var chart = {
        name: "Mock",
        //groupDescriptor: {
        //    fieldName:"ItemCode"
        //},
        aggregateDescriptors: [],
        sortDescriptors: [],
        dataSourceDescriptor: {
            entityId: 3,
            entityName: "LicenseLines",
            componentName: "Request",
            dataFieldDescriptors: [{
                name: "SalesAmount",
                type: "Currency"
            }, {
                name: "ListAmount",
                type: "Currency"
            }, {
                name: "Status"
            }, {
                name: "ItemCode"
            }]
        },
        category: {
            field: "Status"
        },
        axes: [{
                field: "SalesAmount",
                type: "column",
                aggregate: "sum",
                name: "Sales Amount Sum"
            },
            {
                field: "ListAmount",
                type: "column",
                aggregate: "sum",
                name: "List Amount Sum"
            }
        ]
    };

    createChart(host, chart);
}

function createChart(host, chart) {
    var dataSource = createDataSource(chart);
    var chartWidget = {
        dataSource: dataSource,
        series: [],
        //valueAxis: [],
        //categoryAxis:{}
    };

    if (chart.axes) {
        for (var i = 0; i < chart.axes.length; i++) {
            var axeDescriptor = chart.axes[i];

            var serie = {
                name: axeDescriptor.field,
                type: axeDescriptor.type,
                field: axeDescriptor.field
            };
            if (chart.category) {
                serie.categoryField = chart.category.field;
                if (axeDescriptor.aggregate) {
                    serie.aggregate = axeDescriptor.aggregate;
                }
            };

            var axis = {
                name: axeDescriptor.name
            };

            chartWidget.series.push(serie);
            //chartWidget.valueAxis.push(axis);
        }
    }

    if (chart.category) {
        // chartWidget.categoryAxis.field = chart.category.field;
    }

    chartWidget.tooltip = { visible: true };

    host.kendoChart(chartWidget);
}

function createDataSource(chart) {
    var dataSourceDescriptor = chart.dataSourceDescriptor;
    var entityName = dataSourceDescriptor.entityName;
    var dataSource = {
        serverSorting: true,
        serverFiltering: true,
        serverAggregates: false,
        serverPaging: true,
        batch: true,

        transport: {
            read: {
                type: "GET",
                dataType: "json",
                url: "CSIQTEntityService.aspx?entity=" + entityName + "&operation=read"
            }
        },
        schema: {
            type: "json",
            total: "Count",
            data: "Items",
            errors: "SysError",
            model: {
                id: "SysKeyValue",
                fields: {
                    SysEntityName: "SysEntityName",
                    SysKeyValue: "SysKeyValue"
                }
            }
        },
        aggregate: [],
        group: [],
        sort: []
    };

    for (var i = 0; i < dataSourceDescriptor.dataFieldDescriptors.length; i++) {
        var descriptor = dataSourceDescriptor.dataFieldDescriptors[i];
        var fieldName = descriptor.name;
        var field = {
            field: fieldName,
            editable: descriptor.isEditable
        };

        switch (descriptor.type) {
            case "Integer":
            case "Number":
            case "Currency":
            case "Quantity":
            case "Rate":
                {
                    field.type = "number";
                    break;
                }

            case "DateTime":
            case "Date":
            case "Time":
                {
                    field.type = "date";
                    break;
                }

            case "Boolean":
                {
                    field.type = "boolean";
                    break;
                }

            default:
                {
                    field.type = "string";
                    break;
                }
        }
        dataSource.schema.model.fields[fieldName] = field;
    }

    var aggregates = [];

    if (chart.aggregateDescriptors !== null) {
        for (var i = 0; i < chart.aggregateDescriptors.length; i++) {
            var descriptor = chart.aggregateDescriptors[i];

            for (var j = 0; j < descriptor.aggregates.length; j++) {
                aggregates.push({
                    field: descriptor.fieldName,
                    aggregate: descriptor.aggregates[j]
                });
            }
        }
    }

    if (chart.sortDescriptors !== null) {
        for (var i = 0; i < chart.sortDescriptors.length; i++) {
            var descriptor = chart.sortDescriptors[i];

            dataSource.sort.push({
                field: descriptor.fieldName,
                dir: descriptor.direction
            });
        }
    }

    if (chart.groupDescriptor) {
        dataSource.group.push({
            field: chart.groupDescriptor.fieldName
        });
    }
    return new kendo.data.DataSource(dataSource);
};

$(document).ready(function() {
    $("*[data-csiqt-chart]").each(
        function(i) {
            var host = $(this);
            initChart(host);
        });
});