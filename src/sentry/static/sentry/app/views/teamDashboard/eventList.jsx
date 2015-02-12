/*** @jsx React.DOM */

var React = require("react");

var api = require("../../api");
var Count = require("../../components/count");
var LoadingError = require("../../components/loadingError");
var LoadingIndicator = require("../../components/loadingIndicator");
var PropTypes = require("../../proptypes");

var EventNode = React.createClass({
  propTypes: {
    group: PropTypes.Group.isRequired
  },

  render() {
    var group = this.props.group;

    return (
      <li className="group">
        <div className="row">
          <div className="col-xs-8 event-details">
            <h3><a>{group.title}</a></h3>
            <div className="event-message">{group.culprit}</div>
            <div className="event-meta"><span>First:</span> <time time-since="group.firstSeen"></time>. <span>Last:</span> <time time-since="group.lastSeen"></time>.</div>
          </div>
          <div className="col-xs-2 event-users align-right">
            <Count value={group.count} />
          </div>
          <div className="col-xs-2 event-occurrences align-right">
            [todo]
          </div>
        </div>
      </li>
    );
  }
});

var EventList = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    endpoint: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      groupList: [],
      loading: true,
      error: false,
      statsPeriod: "24h"
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  componentDidUpdate(_, prevState) {
    if (this.state.statsPeriod != prevState.statsPeriod) {
      this.fetchData();
    }
  },

  fetchData() {
    this.setState({
      loading: true,
      error: false
    });

    var minutes;
    switch(this.state.statsPeriod) {
      case "15m":
        minutes = "15";
        break;
      case "60m":
        minutes = "60";
        break;
      case "24h":
        minutes = "1440";
        break;
    }

    api.request(this.props.endpoint, {
      query: {
        limit: 5,
        minutes: minutes
      },
      success: (data) => {
        this.setState({
          groupList: data,
          loading: false,
          error: false
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true
        });
      }
    });
  },

  onSelectStatsPeriod(period) {
    this.setState({
      statsPeriod: period
    });
  },

  render() {
    var eventNodes = this.state.groupList.map((item) => {
      return <EventNode group={item} key={item.id} />;
    });

    return (
      <div className="box">
        <div className="box-header clearfix">
          <div className="row">
            <div className="col-xs-8">
              <h3>{this.props.title}</h3>
            </div>
            <div className="col-xs-2 align-right">Users</div>
            <div className="col-xs-2 align-right">Events</div>
          </div>
        </div>
        <div className="box-content">
          <div className="tab-pane active">
            {this.state.loading ?
              <LoadingIndicator />
            : (this.state.error ?
              <LoadingError onRetry={this.fetchData} />
            : (eventNodes.length ?
              <ul className="group-list group-list-small">
                {eventNodes}
              </ul>
            :
              <div className="group-list-empty">No data available.</div>
            ))}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = EventList;
