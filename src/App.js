import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Header_comp from './header_comp.js';
import Result_table from './result_table';
import CountryNames from './countries';

const Countries_List = CountryNames();

//Search Class Component
class Search_country extends React.Component{

  constructor(){
    super();
    const $obj = this;

    $obj.state = {
      error: null,
      isLoaded: false,
      countries: [],
      value: null
    };
    $obj.top_two_countries = [];
  }

  render(){
    const $obj = this;
    return (
      <div id="serch_box" className="container">
        <div className="input-group">
          <input type="text" className="form-control" onChange={this.get_inpt_name.bind(this,$obj)} placeholder="Your Name"></input>
          <div className="input-group-btn">
            <button onClick={() => $obj.Find_country()} className="btn btn-primary search_btn" type="submit"><i class="fa fa-search" ></i> SEARCH</button>
          </div>
        </div>
      </div>   
    )
  }

  get_inpt_name($obj, event){
    $obj.setState({value: event.target.value});
  }

  Find_country() {
    const $obj = this;
    
    const { error, isLoaded, countries, value } = $obj.state;
    $obj.setState({countries: []});
    $obj.state = {countries: []};
    $obj.top_two_countries = [];
    if(!value){
      $obj.load_results();
    }else{
      fetch("https://api.nationalize.io/?name="+value)
        .then(res => res.json())
        .then(
          document.getElementById("loader").className = "preloader show_loader"
        )
        .then(
          (result) => {
            document.getElementById("loader").className = "preloader hide_loader"
            $obj.setState({
              isLoaded: true,
              countries: result.country
            });
            $obj.load_country();
          },
          (error) => {
            $obj.setState({
              isLoaded: true,
              error
            });
          }
      )
    }
  }

  load_results(){
    const $obj = this;
    ReactDOM.render(<$obj.Result_table_comp countries={$obj.top_two_countries} name={$obj.state.value}/>, document.getElementById("countries_table_section"));
  }

  load_country() {
    const $obj = this;
    const { error, isLoaded, countries } = $obj.state;
    var all_probs = [];
    var country_probs = [];

    if (error) {
      return <div>Error: {error.message}</div>;
    }else if (!isLoaded) {
      return <div>Loading...</div>;
    }
    if(countries.length > 1){
      countries.forEach(function(country){
        country_probs.push(country.probability);
        all_probs.push(country.probability);
      });
      var first = country_probs.reduce(function(a, b) {
        var first_max = Math.max(a, b);
        var index = country_probs.indexOf(first_max);
        country_probs.splice(index,1);
        return first_max;
      }, 0);
      var second = country_probs.reduce(function(c, d) {
        var second_max = Math.max(c, d);
        return second_max;
      }, 0);
      $obj.top_two_countries.push($obj.find_corresponding_country(first,all_probs,countries));
      $obj.top_two_countries.push($obj.find_corresponding_country(second,all_probs,countries));

    }else if(countries.length != 0 && countries.length < 2){
      console.log("country is ", countries[0]);
      $obj.top_two_countries.push(countries[0]);
    }
    $obj.load_results();
  }

  find_corresponding_country(prob,country_probs,countries){
    var found_country;
    found_country = countries[country_probs.indexOf(prob)];
    return found_country;
  }

  Result_table_comp(props){
    const $obj = this;

    if(props.countries.length < 1){
      return (
        <p className="Showing_res_text_notfound"><strong>No Data Found..</strong></p>
      );
    }

    return(
      <React.Fragment>
        <p className="Showing_res_text_found"><strong>{props.countries.length}</strong> Country(s) found for your Name `<strong>{props.name.toUpperCase()}</strong>`</p>
        <div className="table_parent_box">
        <table id="countries_table" className="table table-bordered">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Country</th>
              <th>Probability</th>
            </tr>
          </thead>
          <tbody>
          {
                props.countries.map(country => {
                  return(
                    <tr>
                              <td>{props.countries.indexOf(country)+1}</td>
                              <td>{
                              Countries_List.map(countryName=>{
                                if(countryName.code == country.country_id){
                                  return countryName.name;
                                }else{
                                  return "";
                                }
                              })
                            }</td>
                              <td>{country.probability}</td>
                    </tr>
                  );
                })
              }
          </tbody>
        </table>
        </div>
      </React.Fragment>
    )
  }
 
}
//Search Class Component End

// Parent Component
function App() {
  return (
    <div>
      <Header_comp></Header_comp>
      <div className="Search_and_result_container">
        <Search_country></Search_country>
        <Result_table></Result_table>
      </div>
    </div> 
  )
}

export default App;
