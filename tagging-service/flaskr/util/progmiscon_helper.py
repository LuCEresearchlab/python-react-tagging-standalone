import colorsys

import requests


def _json_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        print('Success!')
        return response.json()
    else:
        print(f'Error ${response.status_code}')
        return None


# https://stackoverflow.com/questions/41403936/converting-hsl-to-hex-in-python3
def _hsv_to_rgb(h, s, v):
    rgb = colorsys.hsv_to_rgb(int(h)/360, int(s)/100, int(v)/100)
    return "#" + "".join("%02X" % round(i*255) for i in rgb)


def get_misconceptions():
    url = 'https://progmiscon.org/json/data.json'
    result = _json_from_url(url)
    return result['misconceptions']


def get_java_public_misconceptions():
    misconceptions = get_misconceptions()
    filtered = list(filter(lambda misc: misc['pl'] == 'Java' and misc['status'] == 'public', misconceptions))

    nr_misc = len(filtered) + 1
    colors = [_hsv_to_rgb(h * 360 / nr_misc + 120, 100, 100) for h in range(0, nr_misc)]

    clean = [{
        'name': misc['name'],
        'description': misc['shortDescription'],
        'color': colors[index + 1]
    } for index, misc in enumerate(filtered)]

    return [{
        'name': 'NoMisconception',
        'description': 'No Misconception',
        'color': colors[0]
    }] + list(clean)
