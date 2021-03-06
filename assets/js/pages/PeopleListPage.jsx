import React, {useEffect, useState} from 'react';
import Moment from "react-moment";
import Pagination from "../components/Pagination";
import TableHeader from "../components/TableHeader";
import DefaultAPI from "../sevices/DefaultAPI";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {toast} from "react-toastify";
import TableLoader from "../components/loaders/TableLoader";
import { Link } from "react-router-dom";

/**
 * People List with API pagination
 * @param props
 * @returns {*}
 * @constructor
 */
const PeoplePage = props => {

    const [people, setPeople] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [itemsPerPage, setItemPerPage] = useState(10);
    const [orderRequest, setOrderRequest] = useState([]);

    /**
     * Get data paginated with search and orderBy
     * @returns {Promise<void>}
     */
    const fetchPeople = async () => {
        try {
            const data = await DefaultAPI.findAll('people',currentPage, itemsPerPage, orderRequest);
            setPeople(data["hydra:member"]);
            setTotalItems(data["hydra:totalItems"]);
            setLoading(false);
        } catch (e) {
            toast.error("Upload data failed")
            console.error(e.message);
        }
    };

    /**
     * Get data when vars changing
     */
    useEffect(() => {
       fetchPeople()
    }, [currentPage, itemsPerPage, orderRequest]);

    /**
     * manage page changing
     * @param page
     */
    const handlePageChange = page => {
        setLoading(true);
        setCurrentPage(page);
    };

    /**
     * manage ittems per page
     * @param event
     */
    const handleItemsPerPageChange = event => {
        setCurrentPage(1);
        setItemPerPage(event.currentTarget.value);
    };

    /**
     * Delete person action with confirmation
     * @param id
     * @returns {Promise<void>}
     */
    const handleDelete = async id => {
        const MySwal = withReactContent(Swal)
        MySwal.fire({
            title: <p>Delete ?</p>,
            text: 'This action will be irrevocable',
            icon: 'warning',
            confirmButtonText: 'ok',
            showCancelButton: true,
            cancelButtonText: 'cancel',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            onOpen: () => {

            }
        }).then( async (result) => {
            if(result.value){
                const originalPeople = [...people]
                setPeople( people.filter( people => people.id !== id ) )
                try {
                    toast.success("Item deleted")
                    await DefaultAPI.delete('people',id);
                }catch (e) {
                    setPeople(originalPeople);
                    toast.success("An error occurred")
                }
            }
        })
    }

    return (
        <>
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h1>People List paginated</h1>
                <Link to="/people/new" className="btn btn-primary">Add a person</Link>

            </div>
            <div className="col-2 mb-2">
                <span>Elements par page :</span>
                <select className="form-control" onChange={handleItemsPerPageChange} value={itemsPerPage}>
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div className="form-group col-5">
                <input type="text" className="form-control" placeholder="Search"  />
            </div>

            <table className="table table-hover dataTable">
                <thead>
                    <TableHeader
                        items={
                            [
                                {title: 'Last Name', sortName: 'lastName'},
                                {title: 'First Name', sortName: 'firstName'},
                                {title: 'Gender', sortName: 'gender'},
                                {title: 'Birth Date', sortName: 'birthDate'},
                            ]
                        }
                        setOrderRequest={setOrderRequest}
                        setCurrentPage={setCurrentPage}
                    />
                </thead>
                {!loading && <tbody>

                {people.map(person =>
                    <tr key={person.id}>
                        <td className="text-center">{person.lastName}</td>
                        <td className="text-center">{person.firstName}</td>
                        <td className="text-center">
                            {person.gender === 1 ? 'M' : 'F'}
                        </td>
                        <td className="text-center"><Moment format="DD/MM/YYYY">
                            {person.birthDate}
                        </Moment></td>
                        <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(person.id)}>Delete
                            </button>
                            <Link to={`/people/${person.id}`} className="btn btn-sm btn-success ml-3">Edit</Link>
                        </td>


                    </tr>
                )}

                </tbody>
                }
            </table>

            {loading && (
                <TableLoader/>

            )}


            {itemsPerPage < totalItems && (
                <Pagination
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    length={totalItems}
                    onPageChanged={handlePageChange}
                />
            )}


        </>
    );
};

export default PeoplePage;