import React, { useEffect, useRef } from 'react'
import { useRouteMatch } from 'react-router'
import { Route, Switch, Redirect } from 'react-router-dom'
import SlugPage from './renderDashboard'
import DefaultPage from './renderDashboard/default'
import {
    useMyEvents,
    useActiveEvents,
    usePastEvents,
} from 'graphql/queries/events'
import { useDispatch, useSelector } from 'react-redux'
import * as DashboardSelectors from 'redux/dashboard/selectors'
import * as DashboardActions from 'redux/dashboard/actions'
import * as AuthSelectors from 'redux/auth/selectors'
import * as UserSelectors from 'redux/user/selectors'
import * as UserActions from 'redux/user/actions'

export default () => {
    const match = useRouteMatch()
    const dispatch = useDispatch()
    const event = useSelector(DashboardSelectors.event)

    // Set up browser notifications
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    }, [])

    //SET EVENTS TO DISPLAY
    const [organizerEvents, loading] = useMyEvents()
    const [activeEvents, loadingActive] = useActiveEvents({})
    const [pastEvents, loadingPast] = usePastEvents({ limit: 3 })

    //FIND ROLES AVAILABLE FOR USER
    const idTokenData = useSelector(AuthSelectors.idTokenData)
    const recruiterEvents = useSelector(UserSelectors.userProfileRecruiterEvents)

    const isPartner =
        idTokenData?.roles?.includes('Recruiter') &&
        !idTokenData?.roles?.includes('SuperAdmin') &&
        recruiterEvents?.map(e => e.eventId).includes(event?._id)

    const isOrganizer =
        idTokenData?.roles?.some(r =>
            ['Organiser', 'AssistantOrganiser', 'SuperAdmin'].includes(r),
        ) && organizerEvents?.map(e => e._id).includes(event?._id)

    useEffect(() => {
        if (isPartner) {
            dispatch(UserActions.setAccessRight('partner'))
        } else if (isOrganizer) {
            dispatch(UserActions.setAccessRight('organizer'))
        }
    }, [isPartner, isOrganizer])

    // Dispatch events data to Redux only once when loading completes
    const dispatchedRef = useRef(false)
    useEffect(() => {
        if (!loading && !loadingActive && !loadingPast && !dispatchedRef.current) {
            dispatchedRef.current = true
            if (organizerEvents) dispatch(UserActions.organizerEvents(organizerEvents))
            if (activeEvents) dispatch(DashboardActions.activeEvents(activeEvents))
            if (pastEvents) dispatch(DashboardActions.pastEvents(pastEvents))
        }
    }, [loading, loadingActive, loadingPast])

    //redirect to right event page, default, or out
    return (
        <Switch>
            <Route
                exact={false}
                path={`${match.path}/event/:slug`}
                component={SlugPage}
            />
            <Route
                exact={false}
                path={`${match.path}/default`}
                component={DefaultPage}
            />
            {/* For all other routes, redirect outta here */}
            <Redirect to="/home" />
        </Switch>
    )
}
