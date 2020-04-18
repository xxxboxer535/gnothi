import {Button, Col, Form, Modal} from "react-bootstrap";
import _ from "lodash";
import React, {useEffect, useState} from "react";

function TagForm({fetch_, onSubmit, tag=null}) {
  const [name, setName] = useState(tag ? tag.name : '')

  const id = tag && tag.id

  const changeName = e => setName(e.target.value)

  const destroyTag = async () => {
    if (!window.confirm("Are you sure? This will remove this tag from all entries (your entries will stay).")) {
      return
    }
    await fetch_(`tags/${id}`, 'DELETE')
    onSubmit()
  }

  const submit = async e => {
    e.preventDefault()
    if (id) {
      await fetch_(`tags/${id}`, 'PUT', {name})
    } else {
      await fetch_(`tags`, 'POST', {name})
    }
    onSubmit()
  }

  return <Form onSubmit={submit}>
    <Form.Row>
      <Form.Group as={Col} controlId="formFieldName">
        <Form.Control
          size='sm'
          type="text"
          placeholder="Tag Name"
          value={name}
          onChange={changeName}
        />
      </Form.Group>
      <Form.Group controlId="buttons" as={Col}>
        <Button
          size='sm'
          variant={id ? "primary" : "success"}
          onClick={submit}
        >{id ? "Save" : "Add"}</Button>&nbsp;
        {id && <Button
          size='sm'
          variant='danger'
          onClick={destroyTag}
        >Delete</Button>}
      </Form.Group>
    </Form.Row>
  </Form>
}

function TagModal({fetch_, close, tags, fetchTags}) {
  return (
    <Modal show={true} onHide={close}>
      <Modal.Header>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <TagForm fetch_={fetch_} onSubmit={fetchTags} />
        {tags && tags.map(t =>
          <TagForm
            key={t.id}
            fetch_={fetch_}
            tag={t}
            onSubmit={fetchTags}
          />
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={close}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}


export default function Tags({fetch_, as, selected=null, setSelected=null, server=false}) {
  const [tags, setTags] = useState([])
  const [editTags, setEditTags] = useState(false)

  const fetchTags = async () => {
    const {data, code, message} = await fetch_('tags', 'GET')
    setTags(data)
  }

  useEffect(() => {fetchTags()}, [])

  const selectTag = async (id, v) => {
    if (server) {
      await fetch_(`tags/${id}`, 'PUT', {selected: v})
      fetchTags()
    }
    setSelected({...selected, [id]: v})
  }
  // const clear = async () => {
  //   _.each(tags, t => {selectTag(t.id,false)})
  // }
  const showEditTags = () => setEditTags(true)
  const closeEditTags = () => setEditTags(false)

  const renderTag = t => {
    const selected_ = server ? t.selected : selected[t.id]
    return <>
      <Button
        size="sm"
        variant={selected_ ? 'primary' : 'outline-primary'}
        onClick={() => selectTag(t.id, !selected_)}
      >{t.name}</Button>&nbsp;
    </>
  }

  return <>
    {editTags && <TagModal
      fetch_={fetch_}
      fetchTags={fetchTags}
      tags={tags}
      close={closeEditTags}
    />}
    {/*<Button
      size="sm"
      variant={_.some(tags, 'selected') ? 'outline-primary' : 'primary'}
      onClick={clear}
    >Default</Button>&nbsp;*/}
    {tags.map(renderTag)}
    {!as && <Button
      size="sm"
      variant="light"
      onClick={showEditTags}
    >✏</Button>}
  </>
}
