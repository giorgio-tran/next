#-----------------------------------------------------------------------------
#  Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
#  University of Hawaii, University of Illinois Chicago, Virginia Tech
#
#  Distributed under the terms of the SAGE3 License.  The full license is in
#  the file LICENSE, distributed as part of this software.
#-----------------------------------------------------------------------------

from pydantic import PrivateAttr

from smartbits.smartbit import SmartBit, ExecuteInfo
from smartbits.smartbit import TrackedBaseModel
from jupyterkernelproxy import JupyterKernelProxy


import json


class SageCellState(TrackedBaseModel):
    code: str = ""
    output: str = ""
    kernel: str = ""
    availableKernels: list = []
    privateMessage: list = []
    executeInfo: ExecuteInfo

class SageCell(SmartBit):
    # the key that is assigned to this in state is
    state: SageCellState
    _jupyter_client = PrivateAttr()
    _jupyter_client = PrivateAttr()
    _r_json = PrivateAttr()
    _redis_space = PrivateAttr(default='JUPYTER:KERNELS')

    def __init__(self, **kwargs):
        # THIS ALWAYS NEEDS TO HAPPEN FIRST!!
        super(SageCell, self).__init__(**kwargs)
        self._jupyter_client = JupyterKernelProxy()
        self._r_json = self._jupyter_client.redis_server.json()
        if self._r_json.get(self._redis_space) is None:
            self._r_json.set(self._redis_space, '.', {})

    def handle_exec_result(self, msg):
        self.state.output = json.dumps(msg)
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def generate_error_message(self, user_uuid, error_msg):
        # 'You do not have access to this kernel'
        pm = [{'userId': user_uuid, 'message': error_msg}]
        self.state.privateMessage = pm
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def get_available_kernels(self, user_uuid=None):
        """
        This function will get the kernels from the redis server
        """
        # get all valid kernel ids from jupyter server
        valid_kernel_list = [k['id'] for k in self._jupyter_client.get_kernels()]
        # get all kernels from redis server
        kernels = self._jupyter_client.redis_server.json().get(self._redis_space)
        # remove kernels the list of available kernels that are not in jupyter server
        [kernels.pop(k) for k in kernels if k not in valid_kernel_list]
        available_kernels = []
        for kernel in kernels.keys():
            if user_uuid and kernels[kernel]["is_private"] and kernels[kernel]["owner_uuid"] != user_uuid:
                continue
            if not kernels[kernel]['kernel_alias'] or kernels[kernel]['kernel_alias'] == kernels[kernel]['kernel_name']:
                kernels[kernel]['kernel_alias'] = kernel[:8]
            available_kernels.append({"key": kernel, "value": kernels[kernel]})
        self.state.availableKernels = available_kernels
        self.state.executeInfo.executeFunc = ""
        self.state.executeInfo.params = {}
        self.send_updates()

    def execute(self, uuid):
        """
        Non blocking function to execute code. The proxy has the responsibility to execute the code
        and to call a call_back function which know how to handle the results message
        :param uuid:
        :param code:
        :return:
        """
        command_info = {
            "uuid": uuid,
            "call_fn": self.handle_exec_result,
            "code": self.state.code,
            "kernel": self.state.kernel,
            "token": ""
        }
        if self.state.kernel:
            self._jupyter_client.execute(command_info)
        else:
            # TODO: MLR fix to solve issue #339
            # self.generate_error_message(SOME_USER_ID, "You need to select a kernel")
            self.state.executeInfo.executeFunc = ""
            self.state.executeInfo.params = {}
            self.send_updates()

    def clean_up(self):
        self._jupyter_client.clean_up()
