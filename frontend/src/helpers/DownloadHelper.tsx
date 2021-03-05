const {TAGGING_SERVICE_URL} = require('../../config.json')
const download_url = TAGGING_SERVICE_URL + '/datasets/download/'

// https://www.codevoila.com/post/30/export-json-data-to-downloadable-file-using-javascript
function exportToJsonFile(jsonData: any, dataset_name: string): void {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = dataset_name + '.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

export function downloadDatasetHelper(dataset_id: string, dataset_name: string): void{
    fetch(download_url + dataset_id)
        .then(response => response.json())
        .then(json => {
            exportToJsonFile(json, dataset_name)
        })
}