import React from "react";
import {
  FormGroup,
  ControlLabel,
  HelpBlock,
  Button,
  Alert,
  FormControl
} from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Autocomplete from "react-autocomplete";
import DbError from "./DbError";
import axios from "axios";

class BookingForm extends React.Component {
  constructor() {
    super();
    this.state = {
      guest: null,
      input: ""
    };
  }

  componentDidMount() {
    axios
      .get("/catalog/guests")
      .then(guests_list => this.setState({ guests_list: [guests_list.data] }))
      .catch(err => this.setState({ db_error: err }));
  }

  validateForm = () => {
    if (!this.state.guest || this.props.days.length !== 2) return false;
    return true;
  };

  guestName = guest =>
    guest === null ? "" : guest.first_name + " " + guest.family_name;

  matchInput = input => {
    const pattern = input.toLowerCase().replace(/ /g, "");
    return this.state.guests_list[0].filter(guest =>
      guest.first_name
        .toLowerCase()
        .concat(guest.family_name.toLowerCase())
        .includes(pattern)
    );
  };

  render() {
    if (this.state.db_error) {
      return <DbError />;
    }
    const submitButton = this.validateForm() ? (
      <Button type="submit" bsStyle="success">
        Zapisz
      </Button>
    ) : (
      <Button type="submit" bsStyle="danger" disabled>
        Uzupełnj pola poprawnie
      </Button>
    );

    const errors =
      Array.isArray(this.props.errors) && this.props.errors.length > 0 ? (
        <div>
          <p>
            <strong> Błędy przy zapisie rezerwacji </strong>
          </p>
          {this.props.errors.map((err, index) => (
            <Alert bsStyle="danger" key={index}>
              {err.msg}
            </Alert>
          ))}
        </div>
      ) : this.props.errors ? (
        <Alert bsStyle="danger">
          <strong> Błąd bazy danych.</strong> <br /> Skontaktuj się z
          administratorem.
        </Alert>
      ) : null;
    return this.props.booking ? (
      <Redirect
        to={{
          pathname: "/catalog/booking",
          state: {
            booking: this.props.booking,
            fromBookingCreate: this.props.fromBookingCreate,
            fromBookingUpdate: this.props.fromBookingUpdate
          }
        }}
      />
    ) : (
      <div>
        <form
          onSubmit={event => {
            event.preventDefault();
            this.props.handleSubmit({ guest: this.state.guest });
          }}
        >
          {" "}
          {this.state.guests_list ? (
            <FormGroup>
              <ControlLabel>Wybierz gościa</ControlLabel>
              <HelpBlock>
                {" "}
                Zacznij wpisywać imię bądź nazwisko, a następnie wybierz osobę z
                listy.
              </HelpBlock>
              <Autocomplete
                wrapperStyle={{ position: "relative", display: "inline-block" }}
                value={this.state.input}
                items={
                  this.state.guests_list[this.state.guests_list.length - 1]
                }
                getItemValue={guest => this.guestName(guest)}
                onSelect={(value, item) => {
                  this.setState((state, props) => {
                    let lists = state.guests_list.slice();
                    if (lists.length > 1) {
                      lists.splice(-1, 1);
                    }
                    lists.push([item]);
                    return { input: value, guest: item, guests_list: lists };
                  });
                }}
                onChange={(event, value) => {
                  this.setState((state, props) => {
                    let lists = state.guests_list.slice();
                    if (lists.length > 1) {
                      lists.splice(-1, 1);
                    }
                    lists.push(this.matchInput(value));

                    return { input: value, guests_list: lists, guest: null };
                  });
                }}
                renderMenu={children => <div className="menu">{children}</div>}
                renderItem={(item, isHighlighted) => {
                  return (
                    <div
                      className={
                        "item" + (isHighlighted ? " item-highlighted" : "")
                      }
                      key={item._id}
                    >
                      {this.guestName(item)}
                    </div>
                  );
                }}
              />
            </FormGroup>
          ) : null}
          <FormGroup>
            <ControlLabel> Cena </ControlLabel>
            <FormControl disabled type="number" value={this.props.price} />
          </FormGroup>
          <br />
          {submitButton}
        </form>
        <hr />
        {errors}
      </div>
    );
  }
}
export default BookingForm;
