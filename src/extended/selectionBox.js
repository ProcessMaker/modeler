import { mvc } from 'jointjs';
export default mvc.View.extend(
  {
    options: {
      paper: void 0,
      graph: void 0,
    },
    init: () => {
      // debugger;
      if (this.options) {
        console.log(this.options.paper);
      }
     
      // _.each(this.options.handles, this.addHandle, this);
      console.log('initialized');
    },
  }
);