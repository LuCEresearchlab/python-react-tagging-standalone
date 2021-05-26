import time


def wait_for_dataset(test_client):
    response = test_client.get('/datasets/list')
    while len(response.json) == 0 or not response.json[0]['finished_clustering']:
        time.sleep(0.1)
        response = test_client.get('/datasets/list')


def add_dataset_and_wait(test_client):
    test_client.post('/datasets/upload',
                     headers={"Content-Type": "multipart/form-data"},
                     data={'file': open('test.json', 'rb')})
    wait_for_dataset(test_client=test_client)
