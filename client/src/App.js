import React, { Component, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import _ from 'lodash'
import {
  Container,
  Tabs,
  Tab,
  Form,
  Button
} from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  useRouteMatch,
  useParams
} from "react-router-dom";

const fetch_ = async (route, method='GET', body=null, jwt=null) => {
  const obj = {
    method,
    headers: {'Content-Type': 'application/json'},
  };
  if (body) obj['body'] = JSON.stringify(body)
  if (jwt) obj['headers']['Authorization'] = `JWT ${jwt}`
  const response = await fetch(`http://127.0.0.1:5000/${route}`, obj)
  return await response.json()
}

function Auth({onAuth}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')


  const checkJwt = async () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) { return }
    const res = await fetch_('check-jwt', 'GET', null, jwt)
    if (res.status_code == 401) {
      return localStorage.removeItem('jwt')
    }
    onAuth(jwt);
  }

  useEffect(() => {
    checkJwt()
  }, [])

  const changeUsername = e => setUsername(e.target.value)
  const changePassword = e => setPassword(e.target.value)
  const changePasswordConfirm = e => setPasswordConfirm(e.target.value)

  const login = async () => {
    const res = await fetch_('auth','POST', {username, password})
    const jwt = res.access_token;
    localStorage.setItem('jwt', jwt);
    onAuth(jwt);
  }

  const submitLogin = async e => {
    // TODO switch to Axios https://malcoded.com/posts/react-http-requests-axios/
    e.preventDefault();
    login()
  };

  const submitRegister = async e => {
    e.preventDefault();
    // assert password = passwordConfirm. See react-bootstrap, use yup library or something for form stuff
    const res = await fetch_('register','POST',{username, password})
    login();
  };

  const renderLogin = () => {
    return (
      <Form onSubmit={submitLogin}>
        <Form.Group controlId="formLoginEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            required
            value={username}
            onChange={changeUsername}
          />
        </Form.Group>

        <Form.Group controlId="formLoginPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={changePassword}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    )
  };

  const renderRegister = () => {
    return (
      <Form onSubmit={submitRegister}>
        <Form.Group controlId="formRegisterEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            required
            value={username}
            onChange={changeUsername}
          />
        </Form.Group>

        <Form.Group controlId="formRegisterPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={changePassword}
          />
        </Form.Group>
        <Form.Group controlId="formRegisterPasswordConfirm">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            required
            value={passwordConfirm}
            onChange={changePasswordConfirm}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    )
  };

  return (
    <div>
      <Tabs defaultActiveKey="login">
        <Tab eventKey="login" title="Login">
          {renderLogin()}
        </Tab>
        <Tab eventKey="register" title="Register">
          {renderRegister()}
        </Tab>
      </Tabs>
    </div>
  )
}

function Entries({jwt}) {
  const [entries, setEntries] = useState([])
  const history = useHistory()

  const fetchEntries = async () => {
    const res = await fetch_('entries', 'GET', null, jwt)
    console.log(res);
    setEntries(res.entries)
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const gotoForm = (entry_id=null) => {
    history.push(entry_id ? `/entry/${entry_id}` : '/entry')
  }

  return (
    <div>
      <Button variant="Primary" onClick={() => gotoForm()}>New</Button>
      <h2>Entries</h2>
      <ul>
        {entries.map(e => (
          <li onClick={() => gotoForm(e.id)}>{e.title}</li>
        ))}
      </ul>
    </div>
  )
}

function Entry(props) {
  const {entry_id} = useParams()
  const history = useHistory()
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    (async () => {
      if (!entry_id) { return }
      const res = await fetch_(`entries/${entry_id}`, 'GET', null, props.jwt)
      setTitle(res.title)
      setText(res.text)
    })()
  }, [entry_id])

  const submit = async e => {
    e.preventDefault()
    if (entry_id) {
      await fetch_(`entries/${entry_id}`, 'PUT', {title, text}, props.jwt)
    } else {
      await fetch_(`entries`, 'POST', {title, text}, props.jwt)
    }
    history.push('/')
  }

  const changeTitle = e => setTitle(e.target.value)
  const changeText = e => setText(e.target.value)

  return (
    <Form onSubmit={submit}>
      <Form.Group controlId="formTitle">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Title"
          value={title}
          onChange={changeTitle}
        />
      </Form.Group>

      <Form.Group controlId="formText">
        <Form.Label>Entry</Form.Label>
        <Form.Control
          as="textarea"
          placeholder="Entry"
          required
          rows={10}
          value={text}
          onChange={changeText}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  )
}

class Journal extends Component {
  render() {
    const {jwt} = this.props
    return (
      <Switch>
        <Route path="/entry/:entry_id">
          <Entry jwt={jwt} />
        </Route>
        <Route path="/entry">
          <Entry jwt={jwt} />
        </Route>
        <Route exact path="/">
          <Entries jwt={jwt} />
        </Route>
    </Switch>
    )
  }
}

function App() {
  const [jwt, setJwt] = useState()

  const onAuth = jwt => setJwt(jwt)

  return (
    <Router>
      <Container fluid>
        <h1>ML Journal</h1>
        {
          jwt ? <Journal jwt={jwt} />
            : <Auth onAuth={onAuth} />
        }
      </Container>
    </Router>
  )
}

export default App;
