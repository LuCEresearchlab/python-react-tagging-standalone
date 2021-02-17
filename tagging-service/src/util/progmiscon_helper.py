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


def get_java_public_misconceptions():
    misconceptions = get_misconceptions()
    filtered = filter(lambda misc: misc['pl'] == 'Java' and misc['status'] == 'public', misconceptions)
    clean = map(lambda misc: {'name': misc['name'], 'shortDescription': misc['shortDescription']}, filtered)
    return list(clean)
