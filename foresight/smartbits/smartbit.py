#-----------------------------------------------------------------------------
#  Copyright (c) SAGE3 Development Team
#
#  Distributed under the terms of the SAGE3 License.  The full license is in
#  the file LICENSE, distributed as part of this software.
#-----------------------------------------------------------------------------

from utils.wall_utils import Sage3Communication
from collections import defaultdict
# from json import JSONEncoder
#
# def _default(self, obj):
#     return getattr(obj.__class__, "jsonify", _default.default)(obj)
#
# _default.default = JSONEncoder.default
# JSONEncoder.default = _default


class SmartBit(object):
    # def __init__(self, app_uuid, state_uuid, x, y, width, height, last_update):
    def __init__(self, state_name, data):
        self.state_name = state_name
        self.app_uuid = data["id"]
        self.state_uuid = data['state'][self.state_name]["reference"]
        self.__x = data["position"]["x"]
        self.__y = data["position"]["y"]
        self.__width = data["position"]["height"]
        self.__height = data["position"]["width"]
        self.state = {}

        self.is_collection = False

        self.communication = Sage3Communication.instance()

        # only listens to state variable updates
        self.attrs_callbacks = defaultdict(list)

    def update_from_msg(self, data):
        # update can to features of to data
        if not bool(data["data"]):
            self.app_uuid = data["id"]
            self.state_uuid = data['state'][self.state_name]["reference"]
            self.__x = data["position"]["x"]
            self.__y = data["position"]["y"]
            self.__width = data["position"]["width"]
            self.__height = data["position"]["height"]
        else:
            # update the data (ex. add new image)
            for datum_type in data["data"].keys():
                if datum_type != 'file':
                    for datum in data["data"][datum_type]:
                        if datum["reference"] not in self.state:
                            state = self.get_state(datum["reference"])["data"]
                            self.state[datum["reference"]] = state

    @property
    def x(self):
        return self.__x

    @x.setter
    def x(self, value):
        if value != self.__x:
            self.__x = value
            self.move_app(self.app_uuid, self.__x, self.__y)

    @property
    def y(self):
        return self.__y

    @y.setter
    def y(self, value):
        if value != self.__y:
            self.__y = value
            self.move_app(self.app_uuid, self.__x, self.__y)

    @property
    def width(self):
        return self.__width

    @width.setter
    def width(self, value):
        if value != self.__width:
            self.__width = value
            self.resize_app(self.app_uuid, self.__x, self.__y,
                            self.__width, self.__height)

    @property
    def height(self):
        return self.__height

    @height.setter
    def height(self, value):
        if value != self.__height:
            self.__height = value
            self.resize_app(self.app_uuid, self.__x, self.__y,
                            self.__width, self.__height)

    def get_state(self, obj_uuid=None):
        # TODO: This need to be completely rewritten to use a communication object
        #  the object should be responsible to do its own thing
        if obj_uuid is None:
            obj_uuid = self.state_uuid
        return self.communication.get_app_data(obj_uuid)

    def apply_new_state(self, state):
        # gets new data from server and updates local attributes
        try:
            # self.state.update(state)
            # invoke the callback now
            for key, new_val in state.items():
                self.state[key] = new_val
                if key in self.attrs_callbacks:
                    for func in self.attrs_callbacks[key]:
                        func(new_val)

        except Exception as e:
            raise Exception(f"{e} In SmartBit, cannot update the data")

    def update_state(self, new_attr_vals):
        # updates the states on the Node server
        print(f"\n\n updating the state with {new_attr_vals}")
        self.communication.set_app_state(
            self.state_uuid, new_attr_vals, self.state_type)

    def update_state_attr(self, action_type, new_attr_vals, ):
        # new_attr_vals is only the subset of state we want to pass
        self.communication.set_app_attrs_state(
            self.state_uuid, action_type, new_attr_vals)

    def add_change_listener(self, attr_name, func):
        self.attrs_callbacks[attr_name].append(func)

    def move_app(self, x, y):
        payload = {'id': self.app_uuid, 'type': 'move',
                   'position': {'x': x, 'y': y}}
        response = self.communication.send_payload(payload)
        return response

    def resize_app(self, x, y, width, height):
        payload = {'id': self.app_uuid, 'type': 'resize', 'position': {
            'x': x, 'y': y, 'width': width, 'height': height}}
        response = self.communication.send_payload(payload)
        return response


class ContainerMixin:
    is_collection = True

    # def log(self):
    #     pass
    #
    # def save_state(self):
    #     pass
    #
    # #@_action(enqueue=False)
    # def update_wall_coordinates(self, wall_coordinates):
    #     # assumes wall coordinates are valid (proxy's job )
    #
    #     self.wall_coordinates = wall_coordinates
    #     params = {"wall_coordinates": wall_coordinates}
    #     return {"channel": "execute:down", "action": "update", "action_results": params}
    #
    # #@_action(enqueue=False)
    # def update_attribute(self, attr_name, new_attr_value):
    #     try:
    #         setattr(self, attr_name, new_attr_value)
    #     except:
    #         raise Exception(f"Could not set attribute {attr_name} on class postit {self.__class__.__name__}")
    #     params = {str(attr_name): new_attr_value}
    #     return {"channel": "execute:down", "action": "update", "action_results": params}
    #
    # def jsonify(self, ignore=None, as_string = True):
    #     """
    #     :return:
    #     """
    #     if ignore is None:
    #         ignore = []
    #     json_repr = {}
    #
    #     temp_dict_representation = self.__dict__.copy()
    #     temp_dict_representation['_created_date'] = self.__dict__['_created_date'].__str__()
    #     temp_dict_representation["smartbit_type"] = type(self).__name__
    #     temp_dict_representation["available_actions"] = self.get_actions()
    #     # ignore certain field
    #     for field in ignore:
    #         del(temp_dict_representation[field])
    #
    #     # Use field's jsonify() if it has one
    #     to_remove = []
    #     for k, v in temp_dict_representation.items():
    #         # print(k)
    #         if hasattr(v, "jsonify"):
    #             # we convert the objects to json because we don't want nest json strings
    #             json_repr[k] = v.jsonify()
    #             to_remove.append(k)
    #     for k in to_remove:
    #         del (temp_dict_representation[k])
    #
    #     if as_string:
    #         json_repr.update(temp_dict_representation)
    #
    #     return json_repr
    #
    # def get_possible_actions(self):
    #     return [func[0] for func in inspect.getmembers(self, predicate=inspect.ismethod) if
    #                 hasattr(func[1], "action")]
    #
    # def get_attributes(self):
    #     attributes = inspect.getmembers(self, lambda a: not (inspect.isroutine(a)))
    #     non_ignore_attributes = []
    #     return dict([a for a in attributes if not (a[0].startswith('_'))])
    #
    # def get_actions(self):
    #     return [func[0] for func in inspect.getmembers(self, predicate=inspect.ismethod) if
    #                 hasattr(func[1], "action")]
    #
    # def execute_up(self, msg):
    #     self.redis_client.publish("execute:up", json.dumps(msg))
    #
    # def execute_down(self, msg):
    #     self.redis_client.publish("execute:up", json.dumps(msg))
