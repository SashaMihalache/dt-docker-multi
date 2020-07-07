import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
  state = {
    seenIndices: [],
    values: {},
    index: "",
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndices();
  }

  async fetchValues() {
    const values = await axios.get("/api/values/current");
    this.setState({ values: values.data });
  }

  async fetchIndices() {
    const seenIndices = await axios.get("/api/values/all");
    this.setState({ seenIndices: seenIndices.data });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("/api/values", {
      index: this.state.index,
    });

    this.setState({ index: "" });
    this.fetchValues();
    this.fetchIndices();
  };

  renderSeenIndices() {
    return this.state.seenIndices.map(({ number }) => number).join(", ");
  }

  renderValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={(e) => this.setState({ index: e.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen (PG):</h3>
        {this.renderSeenIndices()}

        <h3>Calculated values (Redis):</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
