#-----------------------------------------------------------------------------
#  Copyright (c) SAGE3 Development Team
#
#  Distributed under the terms of the SAGE3 License.  The full license is in
#  the file LICENSE, distributed as part of this software.
#-----------------------------------------------------------------------------

from smartbits.smartbit import SmartBit
from smartbits.smartbit import TrackedBaseModel
from pydantic import BaseModel
import pandas as pd

class CounterState(TrackedBaseModel):
    data: dict
    execute: dict = {}

class Counter(SmartBit):
    # the key that is assigned to this in state is
    state: CounterState

    def say_hello(self):
        print("Zeroing requested by te user")
        # reset execute = 0

    # @action
    def reset_to_zero(self):
        print("Zeroing requested by te user")
        __func = self.execute["function"]





