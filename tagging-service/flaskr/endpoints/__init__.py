from flask_restx import Api
from flaskr.endpoints.upload_api import api as ns1
from flaskr.endpoints.progmiscon_api import api as ns2
from flaskr.endpoints.datasets_api import api as ns3
from flaskr.endpoints.cluster_api import api as ns4
from flaskr.endpoints.auth import api as ns5

api = Api(version='1.0',
          title='tagging Service',
          description='tagging API',
          )

# add all namespaces to the routes, can also add prefix
api.add_namespace(ns1)
api.add_namespace(ns2)
api.add_namespace(ns3)
api.add_namespace(ns4)
api.add_namespace(ns5)
