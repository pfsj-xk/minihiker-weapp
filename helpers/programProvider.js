/**
 * Program provider deals with fetching program information
 * from the server
 */
class ProgramProvider {

  programGroups = Map;
  accessToken;
  url;

  /**
   * Initialize the ProgramProvider by creating an empty
   * programGroup Map.
   * 
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  constructor () {
    this.programGroups = new Map();
  }

  setApiUrl (url) {
    this.url = url;
  }

  setAccessToken (token) {
    this.accessToken = token;
  }

  /**
   * Add a ProgramGroup to the Provider's Map.
   */
  add(pg) {
    // Reorder the programs when the ProgramGroup is first added.
    this.reorderPrograms(pg);

    // Then add it to the Map
    this.programGroups.set(pg.id, pg);
  }

  /**
   * Add all ProgramGroups from the given Array to the Map.
   */
  addFromArray(array) {
    array.forEach(pg => {
      this.add(pg);
    });
  }

  /**
   * Get a ProgramGroup by id. 
   * It will log a warning if the ProgramGroup is not in the Map.
   */
  get(id) {

    // Parse id in case it is a string
    id = parseInt(id, 10);
    
    if (this.programGroups.has(id)) {
      return this.programGroups.get(id);
    } else {
      console.warn(`ProgramProvider does not have ProgramGroup ${id}`);
      return null;
    }
  }

  /**
   * Reorder the programs of a ProgramGroup based on their 
   * start date.
   */
  reorderPrograms(pg) {
    pg.programs.sort((p1, p2) => {
      let date1 = new Date(p1.start_date);
      let date2 = new Date(p2.start_date);

      if (date1 < date2) {
        return -1;
      } else if (date2 < date1) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  /**
   * Find a program
   * 
   * returns a ProgramGroup or fails if not found in server.
   */
  getProgramGroupIdByProgramId (id) {

    return new Promise ((resolve, reject) => {

      let parent;

      // Inside arrow functions this is the Provider
      this.programGroups.forEach(pg => {
        
        pg.programs.forEach(p => {
          
          console.log("Checking p ID " + p.id + " against ID " + id);

          if (p.id === id) {

            console.log("Found match, returning ProgramGroup " + pg.id);
            parent = pg;

           }

        });

      });

      if (parent) {

        resolve(parent);

      } else {

        console.log("No ProgramGroup found for Program " + id + " fetching from server");
        
        // We don't have the program locally, find it on the server
        const url = this.url + 'programs/' + id + 
          '?expand=programGroup.location,programGroup.programs,programGroup.type,' + 
          'programGroup.programs.registrations,programGroup.programs.period,programGroup.programs.prices';
          
        wx.request({
          url: url,
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.accessToken
          },
          success: res => {

            console.log(res);
            
            if (res.statusCode == 200) {

              console.debug('Got program ' + id + ' from the server');
              this.add(res.data.programGroup);
              resolve(res.data.programGroup);

            } else {

              console.warn("Request successful but no programGroup");
              reject(res);

            }

          },
          fail: res => {
            console.warn("Request failed: " + url);
          },
          complete: res => {
            console.debug("Request completed: " + url);
          }
        });
      }

    });
  }

}

module.exports = ProgramProvider;
