ns("FormBuilder",{},()=>{
  return (fieldIds)=>{
    let get = (fieldID)=>{
      return document.getElementById(fieldID).value;
    };
    this.get = get;
    this.getData = ()=>{
      return fieldIds.reduce((out,fieldId)=>{
        out[fieldId] = get(fieldId);
        return out;
      },{});
    }
  }
});