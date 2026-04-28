import React, { useEffect } from 'react'

import { useRouteMatch } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import PageWrapper from 'components/layouts/PageWrapper'

import PartnerDashboard from './partner'
import ParticipantDashboard from './participant'
import OrganizerDashboard from './organiser'

import * as DashboardSelectors from 'redux/dashboard/selectors'
import * as DashboardActions from 'redux/dashboard/actions'
import * as UserSelectors from 'redux/user/selectors'

export default role => {
    const match = useRouteMatch()
    const dispatch = useDispatch()
    const event = useSelector(DashboardSelectors.event)
    const eventLoading = useSelector(DashboardSelectors.eventLoading)
    const registrationLoading = useSelector(
        DashboardSelectors.registrationLoading,
    )
    const lockedPages = useSelector(DashboardSelectors.lockedPages)
    const shownPages = useSelector(DashboardSelectors.shownPages)
    const userAccessRight = useSelector(UserSelectors.userAccessRight)
    const { slug } = match.params

    /** Update when slug changes */
    useEffect(() => {
        dispatch(DashboardActions.updateEvent(slug))
        dispatch(DashboardActions.updateRegistration(slug))
        dispatch(DashboardActions.updateTeam(slug))
        dispatch(DashboardActions.updateProjects(slug))
    }, [slug])

    useEffect(() => {
        if (event) {
            dispatch(
                DashboardActions.updateRecruitersForEvent(event.recruiters),
            )
        }
    }, [event])

    //TODO: reconstruct to contain partner, organizer & participnat pages
    switch (userAccessRight) {
        case 'partner': {
            return (
                <PageWrapper
                    loading={eventLoading || registrationLoading}
                    wrapContent={false}
                >
                    <PartnerDashboard
                        event={event}
                        originalAlertCount={0}
                        originalAlerts={[]}
                        shownPages={shownPages}
                        lockedPages={lockedPages}
                    />
                </PageWrapper>
            )
        }
        case 'organizer': {
            return (
                <PageWrapper
                    loading={eventLoading || registrationLoading}
                    wrapContent={false}
                >
                    <OrganizerDashboard />
                </PageWrapper>
            )
        }
        case 'participant': {
            return (
                <PageWrapper
                    loading={eventLoading || registrationLoading}
                    wrapContent={false}
                >
                    <ParticipantDashboard
                        event={event}
                        originalAlertCount={0}
                        originalAlerts={[]}
                        shownPages={shownPages}
                        lockedPages={lockedPages}
                    />
                </PageWrapper>
            )
        }
        default:
            return <>error</>
    }
}
