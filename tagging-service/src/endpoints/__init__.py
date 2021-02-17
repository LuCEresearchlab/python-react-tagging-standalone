from flask_restx import Api
from src.endpoints.upload_api import api as ns1
from src.endpoints.grouping_api import api as ns2
from src.endpoints.progmiscon_api import api as ns3

api = Api(version='1.0',
          title='tagging Service',
          description='tagging API',
          )

# add all namespaces to the routes, can also add prefix
api.add_namespace(ns1)
api.add_namespace(ns2)
api.add_namespace(ns3)
