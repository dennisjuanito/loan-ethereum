import React, {Component} from 'react';
import {Form, Input, Message, Button} from 'semantic-ui-react';
import Layout from '../../components/Layout';
import LoanFactory from '../../contracts/LoanFactory.json';
import Loan from '../../contracts/Loan.json';
import getWeb3 from '../../utils/getWeb3';
import CalculateRepayments from '../../utils/calculateRepayments';

export default class RegisterLoanForm extends Component {
    state = {
        loading: false,
        loanTitle: '',
        borrowerAddress: '',
        startDate: '',
        tenor: '',
        interestRatePerYear: '',
        balanceRequested: '',
        origination: '',
        gracePeriod: ''
    };

    onSubmit = async event => {
        event.preventDefault();
        this.setState({loading: true}, async () => {
            try {
                const web3 = await getWeb3();
                const accounts = await web3.eth.getAccounts();
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = LoanFactory.networks[networkId];

                const loanFactoryInstance = new web3.eth.Contract(
                    LoanFactory.abi,
                    deployedNetwork.address
                );

                await loanFactoryInstance.methods.createLoan().send({from: accounts[0]});

                let {
                    // loanTitle,
                    borrowerAddress,
                    startDate,
                    tenor,
                    interestRatePerYear,
                    balanceRequested,
                    origination,
                    gracePeriod
                } = this.state;
                let calculationSchedules = CalculateRepayments(
                    startDate,
                    tenor,
                    interestRatePerYear,
                    balanceRequested,
                    origination,
                    gracePeriod
                );

                const deployedLoanContract = await loanFactoryInstance.methods.getDeployedLoans().call();
                const deployedLoanContractLength = await loanFactoryInstance.methods
                    .getDeployedLoansLength()
                    .call();
                const loanInstance = new web3.eth.Contract(
                    Loan.abi,
                    deployedLoanContract[deployedLoanContractLength - 1]
                );
                await loanInstance.methods
                    .addAllRepaymentSchedules(calculationSchedules, borrowerAddress)
                    .send({from: accounts[0]});
            } catch (error) {
                // Catch any errors for any of the above operations.
                alert(`Failed to load web3, accounts, or contract. Check console for details.`);
                console.error(error);
                this.setState({loading: false});
            }
        });
    };

    render() {
        return (
            <Layout>
                <Form onSubmit={this.onSubmit}>
                    <h2 className='ui header'>Register a Loan</h2>
                    <Form.Field>
                        <label>Loan Title</label>
                        <Input
                            value={this.state.loanTitle}
                            onChange={event => this.setState({loanTitle: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Borrower Address</label>
                        <Input
                            value={this.state.borrowerAddress}
                            onChange={event => this.setState({borrowerAddress: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Starting Date</label>
                        <Input
                            label='YYYY-MM-DD'
                            labelPosition='right'
                            value={this.state.startDate}
                            onChange={event => this.setState({startDate: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Tenor</label>
                        <Input
                            label='months'
                            labelPosition='right'
                            value={this.state.tenor}
                            onChange={event => this.setState({tenor: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Balance Requested</label>
                        <Input
                            label='rupiah'
                            labelPosition='right'
                            value={this.state.balanceRequested}
                            onChange={event => this.setState({balanceRequested: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Interest Rate Per Year</label>
                        <Input
                            label='%'
                            labelPosition='right'
                            value={this.state.interestRatePerYear}
                            onChange={event => this.setState({interestRatePerYear: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Origination</label>
                        <Input
                            label='%'
                            labelPosition='right'
                            value={this.state.origination}
                            onChange={event => this.setState({origination: event.target.value})}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Grace Period</label>
                        <Input
                            label='months'
                            labelPosition='right'
                            value={this.state.gracePeriod}
                            onChange={event => this.setState({gracePeriod: event.target.value})}
                        />
                    </Form.Field>
                    <Button type='submit' primary>
                        Create
                    </Button>
                </Form>
            </Layout>
        );
    }
}

// const campaign = Loan(this.props.address);

// this.setState({loading: true, errorMessage: ''});

// try {
//     const accounts = await web3.eth.getAccounts();
//     await campaign.methods.contribute().send({
//         from: accounts[0],
//         value: web3.utils.toWei(this.state.value, 'ether')
//     });
//     console.log('Now redirecting to address');
//     Router.replaceRoute(`/campaigns/${this.props.address}`);
//     console.log('Just redirected');
// } catch (err) {
//     this.setState({errorMessage: err.message});
// }

// this.setState({loading: false, value: ''});

// import React from 'react';
// // import Layout from '../../components/Layout';
// import RegisterLoanForm from '../../components/RegisterLoanForm';
// export default () => {
//     return (
//         // <Layout>
//             <RegisterLoanForm />
//         // </Layout>
//     );
// };

//         loanTitle: 'test form',
//         borrowerAddress: '0x0bD041752FB439Bd7D43b45d2c914FcfA0dfDD8f',
//         startDate: '2018-10-07',
//         tenor: '12',
//         interestRatePerYear: '24',
//         balanceRequested: '1500000',
//         origination: '3',
//         gracePeriod: '0'
