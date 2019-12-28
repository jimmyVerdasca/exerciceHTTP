module.exports = {
    /**
     * replace the _id field of the object by id. because mongoDB store id in the _id field.
     * @param {*} object 
     */
    dbToObject: function(object) {
        object['id'] = object._id;
        delete object._id;
        return object
    },
  
    /**
     * check that the data object has valid number and type of fields.
     * Return true if valid, false otherwise.
     * @param {*} data to check the fields
     */
    checkDataCreationFields: function(data) {
        if (typeof data === 'object') {
            if(data.length > 10) {
                return false;
            }
            let countFields = 0;
            for (var prop in data) {
                if (Object.prototype.hasOwnProperty.call(data, prop)) {
                    countFields++;
                    if (countFields > 10) {
                        return false;
                    }
                    if (typeof data[prop] !== 'number'
                    && (typeof data[prop] !== 'string' || data[prop].length > 512)) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }
}