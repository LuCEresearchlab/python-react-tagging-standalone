import requests


def _json_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        print('Success!')
        return response.json()
    else:
        print(f'Error ${response.status_code}')
        return None


def get_misconceptions():
    url = 'https://progmiscon.org/json/data.json'
    result = _json_from_url(url)
    return result['misconceptions']
