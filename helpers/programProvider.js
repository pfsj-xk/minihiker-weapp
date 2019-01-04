/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  ready = false;

  url = 'http://minihiker.com/api/';
  resUrl = 'http://minihiker.com/webapp/';
  authToken = 'Bearer Bt6w40-Z9l7biq8PiNNpYdSKFR5nirbv';
  programGroups = [];
  programTypes = {};
  programPeriods = {};

  /**
   * Fetch all program group information from the server
   */
  fetchProgramGroups() {
    console.log('Fetching program-groups from the server');

    var endpoint = 'program-groups?weapp_visible=true';

    wx.request({
      url: this.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken
      },
      success: (res) => {
        // If the request is successful we should get programs back        
        this.programGroups = res.data;

        this.programGroups.forEach((programGroup) => {
          this.fetchProgramDetails(programGroup);
        });

        this.ready = true;
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });
  }

  /** 
   * After successfully fetching programGroups fetch missing information
   * for all of them
   */
  fetchProgramDetails (programGroup) {

    // Point to the right cover image
    programGroup.weapp_cover_image = this.resUrl + 'img/pg/' + 
      programGroup.id + '/' + programGroup.weapp_cover_image;
    
    // Fetch the program type
    if (this.programTypes[programGroup.type_id] === undefined) {
      console.log('unknown programGroup type, fetching from server');
      this.fetchProgramType(programGroup.type_id);
    }

    // Initialize registration_open to false
    programGroup.registration_open = false;

    // Fetch program instances
    this.fetchProgramInstances(programGroup);

    // Fetch programGroup images
    // TODO lazy fetch image data
    this.fetchProgramGroupImages(programGroup.id);
  }

  /**
   * Fetch all the program instances related to the program group.
   * 
   * This method will use each program's registration_open attribute
   * to determine and set the registration status of the program group.
   */
  fetchProgramInstances(programGroup) {

    var endpoint = 'programs?program_group_id=' + programGroup.id + 
      '&expand=registrations,period';

    wx.request({
      url: this.url + endpoint,
      header: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken
      },
      success: (res) => {

        // If the request is successful assign to object
        programGroup.programs = res.data;

        // Update the program registration status
        programGroup.programs.forEach((program) => {
          if (program.registration_open) {
            programGroup.registration_open = true;
          }
        });
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });

  }

  /**
   * Fetch a program-type from the server
   */
  fetchProgramType(id) {

    this.programTypes[id] = {}; // Temporary assignment

    console.debug('Sending Request for program-type ' + id);

    var endpoint = 'program-types/' + id;

    wx.request({
      url: this.url + endpoint,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // If the request is successful we should get programs back
        this.programTypes[id] = res.data;
      },
      fail: (res) => {
        console.warn('Request failed. ' + this.url + endpoint);
        this.programTypes[id] = undefined;  // Assign undefined to know that we failed
      },
      complete: (res) => {
        console.log('Request completed. ' + this.url + endpoint);
      }
    });

  }

  /**
   * Fetch from the server the image data related to one
   * programGroup and save it into the programGroup.
   */
  fetchProgramGroupImages(id) {

    var programGroup = this.getProgramGroup(id);

    if (programGroup === null || programGroup === undefined) {
      console.warn('No programGroup found for id ' + id);
    } else if(programGroup.images === undefined) {

      var endpoint = 'images?program_group_id=' + id;

      wx.request({
        url: this.url + endpoint,
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        },
        success: (res) => {
          // If the request is successful we should get programs back
          programGroup.images = res.data;
        },
        fail: (res) => {
          console.warn('Request failed. ' + this.url + endpoint);
        },
        complete: (res) => {
          console.log('Request completed. ' + this.url + endpoint);
        }
      });

    }
  }

  /**
   * Find a return a programGroup given it's ID value
   */
  getProgramGroup(id) {
    return this.programGroups.find(item => {
      return item.id === parseInt(id, 10);
    });
  }

}

module.exports = ProgramProvider;